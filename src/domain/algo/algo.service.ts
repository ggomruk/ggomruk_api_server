import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BacktestDTO } from './common/dto/backtest.dto';
import { v4 as uuidv4 } from 'uuid';
import { BacktestService } from 'src/common/database/service/backtest.service';
import { OptimizationTaskService } from 'src/common/database/service/optimizationTask.service';
import { OptimizationResultService } from 'src/common/database/service/optimizationResult.service';
import { IBacktestParams } from 'src/common/database/schema/backtestParams.schema';
import { AlgoException, AlgoExceptionCode } from './algo.exception';
import { SignalDTO } from './common/dto/signal.dto';
import { OptimizeDTO } from './common/dto/optimize.dto';
import RedisMessageQueueClient from 'src/domain/redis/messageQueue/redis.mq.client';
import { BacktestPubSubService } from 'src/domain/redis/messageQueue/backtest-pubsub.service';
import { WebsocketGateway } from 'src/domain/websocket/websocketGateway';

@Injectable()
export class AlgoService implements OnModuleInit {
  private readonly logger = new Logger(AlgoService.name);

  constructor(
    private readonly redisService: RedisMessageQueueClient,
    private readonly backtestService: BacktestService,
    private readonly optimizationTaskService: OptimizationTaskService,
    private readonly optimizationResultService: OptimizationResultService,
    private readonly backtestPubSub: BacktestPubSubService,
    private readonly websocketGateway: WebsocketGateway
  ) {}

  onModuleInit() {
    this.backtestPubSub.onOptimizationComplete(async (data) => {
      this.logger.log(`Optimization ${data.optimizationId} completed. Updating database.`);
      try {
        await this.optimizationTaskService.updateOptimizationStatus(
          data.optimizationId,
          'completed',
          data.resultId
        );
      } catch (error) {
        this.logger.error(`Failed to update optimization status: ${error.message}`);
      }
    });
  }


  async runBacktest(data: BacktestDTO, userId: string) {
    const backtestId = uuidv4();
    let backtestParams: IBacktestParams = data.toBacktestParams();

    // Insert backtest data if not exists
    try {
      await this.backtestService.saveWithUidAndBacktestParams(backtestId, backtestParams, userId);
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
    
    const optimizationParams = {
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
    };

    // Save optimization request to database
    try {
      await this.optimizationTaskService.createOptimizationTask(
        optimizationId,
        userId,
        optimizationParams
      );
      this.logger.log(`Saved optimization task ${optimizationId} to database`);
    } catch (error) {
      this.logger.error(`Failed to save optimization task: ${optimizationId}`, error);
      throw new Error('Failed to save optimization task');
    }
    
    try {
      await this.backtestPubSub.publishOptimizationTask({
        optimizationId,
        userId,
        params: optimizationParams
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

  async getUserOptimizations(userId: string) {
    try {
      const tasks = await this.optimizationTaskService.getUserOptimizationTasks(userId);
      return tasks.map(task => ({
        optimizationId: task.optimizationId,
        userId: task.userId,
        status: task.status,
        params: task.params,
        resultId: task.resultId,
        createdAt: (task as any).createdAt,
        updatedAt: (task as any).updatedAt,
      }));
    } catch (error) {
      this.logger.error(`Failed to get user optimizations: ${error.message}`);
      throw error;
    }
  }

  async getOptimizationResult(optimizationId: string) {
    try {
      return await this.optimizationResultService.getOptimizationResult(optimizationId);
    } catch (error) {
      this.logger.error(`Failed to get optimization result: ${error.message}`);
      throw error;
    }
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

  async getBacktestHistory(userId: string) {
    return await this.backtestService.getUserBacktests(userId);
  }
}
