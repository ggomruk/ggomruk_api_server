import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BacktestRequest, BacktestResponse } from './backtest.interface';
import { v4 as uuidv4 } from 'uuid';
import { BacktestPubSubService } from '../../redis/messageQueue/backtest-pubsub.service';
import { Backtest, BacktestDocument } from './schemas/backtest.schema';

@Injectable()
export class BacktestService {
  private readonly logger = new Logger(BacktestService.name);

  constructor(
    private readonly backtestPubSubService: BacktestPubSubService,
    @InjectModel(Backtest.name) private backtestModel: Model<BacktestDocument>,
  ) {}

  async runBacktest(
    backtestRequest: BacktestRequest,
    userId: string,
  ): Promise<BacktestResponse> {
    const backtestId = uuidv4();

    try {
      this.logger.log(
        `Running backtest ${backtestId} for user ${userId}: ${backtestRequest.symbol} ${backtestRequest.interval}`,
      );

      // Prepare task for Redis
      // Map BacktestRequest to BacktestTaskMessage structure
      const strategies = Object.keys(backtestRequest.strategyParams.strategies || {});
      
      const task = {
        backtestId,
        userId,
        params: {
          symbol: backtestRequest.symbol,
          interval: backtestRequest.interval,
          startDate: backtestRequest.startDate,
          endDate: backtestRequest.endDate,
          usdt: backtestRequest.usdt,
          tc: backtestRequest.tc,
          leverage: backtestRequest.leverage,
          strategies: strategies,
          strategyParams: backtestRequest.strategyParams.strategies,
        }
      };

      // Publish to Redis
      await this.backtestPubSubService.publishTask(task);

      this.logger.log(`Backtest task ${backtestId} published successfully`);

      // Return pending response
      const backtestResponse: BacktestResponse = {
        backtestId,
        strategyName: 'Pending',
        leverageApplied: backtestRequest.leverage,
        totalReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        totalTrades: 0,
        winRate: 0,
        finalBalance: 0,
        performance: {},
        leveredPerformance: {},
      };

      return backtestResponse;
    } catch (error) {
      this.logger.error(
        `Backtest ${backtestId} failed to publish: ${error.message}`,
        error.stack,
      );

      throw new HttpException(
        'Internal server error during backtest submission',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBacktestResult(backtestId: string, userId: string): Promise<any> {
    try {
      this.logger.log(`Querying DB for backtestId: ${backtestId}, userId: ${userId}`);
      const backtest = await this.backtestModel.findOne({ backtestId, userId }).exec();
      
      if (!backtest) {
        this.logger.warn(`Backtest not found in collection: ${this.backtestModel.collection.name}`);
        throw new HttpException('Backtest not found', HttpStatus.NOT_FOUND);
      }
      return backtest.result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to fetch backtest result: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to fetch backtest result',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBacktestHistory(userId: string): Promise<any[]> {
    try {
      this.logger.log(`Fetching backtest history for user ${userId}`);
      const history = await this.backtestModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('-result') // Exclude large result object
        .exec();
      return history;
    } catch (error) {
      this.logger.error(
        `Failed to fetch backtest history: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to fetch backtest history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
