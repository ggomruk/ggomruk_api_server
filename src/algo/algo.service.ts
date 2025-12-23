import { Injectable, Logger } from '@nestjs/common';
import { BacktestDTO } from './dto/backtest.dto';
import { v4 as uuidv4 } from 'uuid';
import { E_Task } from './enum/task';
import { BacktestService } from 'src/database/service/backtest.service';
import { IBacktestParams } from 'src/database/schema/backtestParams.schema';
import { AlgoException, AlgoExceptionCode } from './algo.exception';
import { SignalDTO } from './dto/signal.dto';
import { OptimizeDTO } from './dto/optimize.dto';
import RedisMessageQueueClient from 'src/redis/messageQueue/redis.mq.client';
import { BacktestPubSubService } from 'src/redis/messageQueue/backtest-pubsub.service';
import { WebsocketGateway } from 'src/websocket/websocketGateway';

@Injectable()
export class AlgoService {
  private readonly logger = new Logger(AlgoService.name);

  constructor(
    private readonly redisService: RedisMessageQueueClient,
    private readonly backtestService: BacktestService,
    private readonly backtestPubSub: BacktestPubSubService,
    private readonly websocketGateway: WebsocketGateway
  ) {}

  async runBacktest(data: BacktestDTO, userId: string) {
    const backtestId = uuidv4();
    let backtestParams: IBacktestParams = data.toBacktestParams();

    // Insert backtest data if not exists
    try {
      await this.backtestService.saveWithUidAndBacktestParams(backtestId, backtestParams);
      this.logger.log(`Saved backtest ${backtestId} to database`);
    } catch (error) {
      this.logger.error(`Failed to save backtest data: ${backtestId}`);
      throw new AlgoException(AlgoExceptionCode.DUPLICATE_UID, 'Duplicate backtest exists');
    }
    
    try {
      // Publish backtest task to analytics server via Redis Pub/Sub
      await this.backtestPubSub.publishTask({
        backtestId,
        userId,
        params: {
          symbol: backtestParams.symbol,
          interval: backtestParams.interval,
          startDate: backtestParams.startDate.toISOString(),
          endDate: backtestParams.endDate.toISOString(),
          leverage: backtestParams.leverage,
          tc: backtestParams.commission, // Python expects 'tc' field
          usdt: backtestParams.usdt,
          strategies: backtestParams.strategies as any,
          strategyParams: backtestParams as any,
        },
      });

      this.logger.log(`Published backtest task ${backtestId} to Redis`);

      // Notify client via WebSocket that backtest has started
      this.websocketGateway.emitBacktestStarted(userId, backtestId, {
        status: 'pending',
        params: backtestParams,
      });

    } catch (error) {
      this.logger.error(`Error while sending backtest data: ${error.message}`);
      throw new Error(error.message);
    }

    return backtestId;
  }

  async runOptimization(data: OptimizeDTO, userId: string) {
    const optimizationId = uuidv4();
    
    // TODO: Save optimization request to database (similar to backtest)
    // For now, we'll just publish it to Redis
    
    try {
      await this.backtestPubSub.publishOptimizationTask({
        optimizationId,
        userId,
        params: {
          symbol: data.symbol,
          interval: data.interval,
          startDate: data.startDate,
          endDate: data.endDate,
          strategies: data.strategies.map(s => ({
            id: s.id,
            type: s.type,
            parameters: s.parameters.map(p => ({
              name: p.name,
              min: Number(p.min),
              max: Number(p.max),
              step: Number(p.step)
            }))
          }))
        }
      });

      this.logger.log(`Published optimization task ${optimizationId} to Redis`);
      
      // Notify client via WebSocket
      // this.websocketGateway.emitOptimizationStarted(...)

    } catch (error) {
      this.logger.error(`Error while sending optimization data: ${error.message}`);
      throw new Error(error.message);
    }

    return optimizationId;
  }

  async registerSignal(data: SignalDTO) {
    const uid = uuidv4(); 
    let signalParams = data.toSignalParams()
  }

  async getUserBacktests(userId: string, limit: number = 50) {
    try {
      const backtests = await this.backtestService.getUserBacktests(userId, limit);
      
      // Transform to API response format
      return backtests.map(bt => ({
        backtestId: bt._id,
        userId: bt.uid,
        status: bt.result ? 'completed' : 'pending',
        params: bt.backtestParams,
        result: bt.result,
        createdAt: (bt as any).createdAt,
        completedAt: bt.result ? (bt as any).updatedAt : null,
      }));
    } catch (error) {
      this.logger.error(`Failed to get user backtests: ${error.message}`);
      throw error;
    }
  }

  async getBacktestById(backtestId: string) {
    try {
      const backtest = await this.backtestService.getBacktestById(backtestId);
      
      if (!backtest) {
        return null;
      }

      return {
        backtestId: backtest._id,
        userId: backtest.uid,
        uid: backtest.uid,
        status: backtest.result ? 'completed' : 'pending',
        params: backtest.backtestParams,
        result: backtest.result,
        createdAt: (backtest as any).createdAt,
        completedAt: backtest.result ? (backtest as any).updatedAt : null,
      };
    } catch (error) {
      this.logger.error(`Failed to get backtest by ID: ${error.message}`);
      throw error;
    }
  }
}
