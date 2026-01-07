import { Injectable, Logger } from '@nestjs/common';
import { BacktestSchemaRepository } from './backtest.repository';
import { BacktestDocument } from './schemas/backtest.schema';
import { IBacktestParams } from './schemas/backtestParams.schema';
import {
  AlgoException,
  AlgoExceptionCode,
} from 'src/domain/algo/algo.exception';
import { v4 as uuidv4 } from 'uuid';
import RedisMessageQueueClient from '../../redis/messageQueue/redis.mq.client';
import { BacktestPubSubService } from '../../redis/messageQueue/backtest-pubsub.service';
import { WebsocketGateway } from '../../websocket/websocketGateway';
import { BacktestRequest } from './backtest.interface';

@Injectable()
export class BacktestService {
  private readonly logger = new Logger(BacktestService.name);

  constructor(
    private readonly backtestRepository: BacktestSchemaRepository,
    private readonly redisService: RedisMessageQueueClient,
    private readonly backtestPubSub: BacktestPubSubService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async findByUid(uid: string): Promise<BacktestDocument | null> {
    let document = this.backtestRepository.findByUid(uid);
    return document;
  }

  async findByUidAndCheckResult(uid: string): Promise<BacktestDocument | null> {
    return null;
  }

  async saveWithUidAndBacktestParams(
    uid: string,
    params: IBacktestParams,
    userId?: string,
  ): Promise<BacktestDocument> {
    let result = await this.backtestRepository.insertData({
      uid,
      backtestParams: params,
      userId,
    });
    return result;
  }

  async checkAndUpdateResultIfUidExists(
    uid: string,
    result: any,
  ): Promise<BacktestDocument> {
    let document = await this.backtestRepository.findByUid(uid);
    if (!document) {
      // Record not found
      throw new AlgoException(
        AlgoExceptionCode.BACKTEST_NOT_FOUND,
        `Backtest with uid ${uid} not found`,
      );
    } else if (!document.result) {
      // Record found but result not found, update the result field
      document.result = result;
      let updatedDocument = await this.backtestRepository.upsertData(document);
      return updatedDocument;
    } else {
      // Record found and result already exists
      throw new AlgoException(
        AlgoExceptionCode.BACKTEST_RESULT_ALREADY_EXISTS,
        `Backtest with uid ${uid} already has a result`,
      );
    }
  }

  async getUserBacktests(
    userId: string,
    limit: number = 50,
  ): Promise<BacktestDocument[]> {
    return await this.backtestRepository.findByUserId(userId, limit);
  }

  async getBacktestById(backtestId: string): Promise<BacktestDocument | null> {
    return await this.backtestRepository.findById(backtestId);
  }

  async deleteBacktest(backtestId: string): Promise<boolean> {
    return await this.backtestRepository.deleteById(backtestId);
  }

  /**
   * Get optimization result from MongoDB (saved by analytics server)
   */
  async getOptimizationResult(optimizationId: string): Promise<any> {
    try {
      const result =
        await this.backtestRepository.findOptimizationResult(optimizationId);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch optimization result: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Get walk-forward analysis result from MongoDB (saved by analytics server)
   */
  async getWalkForwardResult(analysisId: string): Promise<any> {
    try {
      const result =
        await this.backtestRepository.findWalkForwardResult(analysisId);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch walk-forward result: ${error.message}`,
      );
      return null;
    }
  }

  // --- Business Logic Methods ---

  async runBacktest(data: BacktestRequest, userId: string) {
    const backtestId = uuidv4();

    const backtestParams: IBacktestParams = {
      symbol: data.symbol,
      interval: data.interval,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      commission: data.tc,
      usdt: data.usdt,
      leverage: data.leverage,
      strategyName: data.strategyName,
      strategies: data.strategyParams.strategies as any,
    };

    // Insert backtest data
    try {
      await this.saveWithUidAndBacktestParams(
        backtestId,
        backtestParams,
        userId,
      );
      this.logger.log(`Saved backtest ${backtestId} to database`);
    } catch (error) {
      this.logger.error(`Failed to save backtest data: ${backtestId}`);
      throw new AlgoException(
        AlgoExceptionCode.DUPLICATE_UID,
        'Duplicate backtest exists',
      );
    }

    try {
      // Publish task
      await this.backtestPubSub.publishTask({
        backtestId,
        userId,
        params: {
          symbol: backtestParams.symbol,
          interval: backtestParams.interval,
          startDate: backtestParams.startDate.toISOString(),
          endDate: backtestParams.endDate.toISOString(),
          leverage: backtestParams.leverage,
          tc: backtestParams.commission,
          usdt: backtestParams.usdt,
          strategies: backtestParams.strategies as any,
          strategyParams: backtestParams as any,
        },
      });

      this.logger.log(`Published backtest task ${backtestId} to Redis`);

      // Notify client
      this.websocketGateway.emitBacktestStarted(userId, backtestId, {
        status: 'pending',
        params: backtestParams,
      });
    } catch (error) {
      this.logger.error(`Error while sending backtest data: ${error.message}`);
      throw new Error(error.message);
    }

    return {
      backtestId,
      status: 'pending',
      message: 'Backtest has been queued for processing',
    } as any;
  }

  async getBacktestHistory(userId: string) {
    const history = await this.getUserBacktests(userId);
    return history.map((h) => {
      // Use custom strategyName if provided, otherwise generate from strategies
      let strategyName: string;

      if (h.backtestParams.strategyName) {
        strategyName = h.backtestParams.strategyName;
      } else {
        const strategies = h.backtestParams.strategies;
        // strategies is a Mongoose document, so we might need to convert to object or check keys carefully
        const strategyNames = Object.keys(strategies).filter(
          (k) =>
            ['bb', 'macd', 'rsi', 'rv', 'sma', 'so'].includes(k) &&
            (strategies as any)[k] != null,
        );
        strategyName =
          strategyNames.length > 0
            ? strategyNames.join('+').toUpperCase()
            : 'Unknown';
      }

      return {
        id: h.uid,
        name: strategyName,
        strategy: strategyName,
        symbol: h.backtestParams.symbol,
        date: (h as any).createdAt,
        result: h.result,
      };
    });
  }

  async getBacktestResult(backtestId: string, userId: string) {
    const backtest = await this.getBacktestById(backtestId);
    if (!backtest) return null;
    // In a real app, check if backtest belongs to userId

    // If result is missing, return the whole document so we can debug
    if (!backtest.result) {
      this.logger.warn(`Backtest ${backtestId} found but has no result field`);
      return {
        status: 'pending',
        message: 'Backtest is still processing or failed',
        backtest,
      };
    }

    return backtest;
  }
}
