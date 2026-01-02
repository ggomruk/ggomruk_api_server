import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_PUBLISHER, REDIS_SUBSCRIBER } from '../redis.provider';

export interface BacktestTaskMessage {
  backtestId: string;
  userId: string;
  params: {
    symbol: string;
    interval: string;
    startDate: string;
    endDate: string;
    leverage: number;
    tc: number;
    usdt: number;
    strategies: string[];
    strategyParams: any;
  };
}

export interface OptimizationTaskMessage {
  optimizationId: string;
  userId: string;
  params: {
    symbol: string;
    interval: string;
    startDate: string;
    endDate: string;
    strategies: {
      id: string;
      type: string;
      parameters: {
        name: string;
        min: number;
        max: number;
        step: number;
      }[];
    }[];
    usdt?: number;
    leverage?: number;
    tc?: number; // commission
    metric?: string;
  };
}

export interface BacktestProgressMessage {
  backtestId: string;
  userId: string;
  progress: number;
  message: string;
  currentDate?: string;
}

export interface BacktestCompleteMessage {
  backtestId: string;
  userId: string;
  status: 'success' | 'error';
  resultId?: string;
  error?: string;
  summary?: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

@Injectable()
export class BacktestPubSubService implements OnModuleInit {
  private readonly logger = new Logger(BacktestPubSubService.name);

  // Channel names
  private readonly CHANNELS = {
    TASK: 'backtest:task',
    OPTIMIZE: 'backtest:optimize',
    PROGRESS: 'backtest:progress',
    COMPLETE: 'backtest:complete',
    ERROR: 'backtest:error',
    // New channels for optimization and walk-forward
    OPTIMIZATION_TASK: 'optimization:task',
    OPTIMIZATION_PROGRESS: 'optimization:progress',
    OPTIMIZATION_COMPLETE: 'optimization:complete',
    WALKFORWARD_TASK: 'walkforward:task',
    WALKFORWARD_PROGRESS: 'walkforward:progress',
    WALKFORWARD_COMPLETE: 'walkforward:complete',
  };

  // Event callbacks
  private progressCallbacks: ((data: BacktestProgressMessage) => void)[] = [];
  private completeCallbacks: ((data: BacktestCompleteMessage) => void)[] = [];
  private errorCallbacks: ((data: BacktestCompleteMessage) => void)[] = [];

  // Optimization callbacks
  private optimizationProgressCallbacks: ((data: any) => void)[] = [];
  private optimizationCompleteCallbacks: ((data: any) => void)[] = [];

  // Walkforward callbacks
  private walkforwardProgressCallbacks: ((data: any) => void)[] = [];
  private walkforwardCompleteCallbacks: ((data: any) => void)[] = [];

  constructor(
    @Inject(REDIS_PUBLISHER) private readonly publisher: Redis,
    @Inject(REDIS_SUBSCRIBER) private readonly subscriber: Redis,
  ) {
    this.setupErrorHandlers();
  }

  async onModuleInit() {
    await this.subscribeToChannels();
    this.logger.log(
      'BacktestPubSubService initialized and subscribed to channels',
    );
  }

  private setupErrorHandlers() {
    this.publisher.on('error', (err) => {
      this.logger.error('Publisher Redis error:', err);
    });

    this.subscriber.on('error', (err) => {
      this.logger.error('Subscriber Redis error:', err);
    });

    this.publisher.on('connect', () => {
      this.logger.log('Publisher connected to Redis');
    });

    this.subscriber.on('connect', () => {
      this.logger.log('Subscriber connected to Redis');
    });
  }

  private async subscribeToChannels() {
    try {
      await this.subscriber.subscribe(
        this.CHANNELS.PROGRESS,
        this.CHANNELS.COMPLETE,
        this.CHANNELS.ERROR,
        this.CHANNELS.OPTIMIZATION_PROGRESS,
        this.CHANNELS.OPTIMIZATION_COMPLETE,
        this.CHANNELS.WALKFORWARD_PROGRESS,
        this.CHANNELS.WALKFORWARD_COMPLETE,
      );

      this.subscriber.on('message', (channel, message) => {
        this.handleMessage(channel, message);
      });

      this.logger.log(
        `Subscribed to channels: ${Object.values(this.CHANNELS).join(', ')}`,
      );
    } catch (error) {
      this.logger.error('Failed to subscribe to channels:', error);
      throw error;
    }
  }

  private handleMessage(channel: string, message: string) {
    try {
      const data = JSON.parse(message);

      switch (channel) {
        case this.CHANNELS.PROGRESS:
          this.logger.debug(
            `Progress update for backtest ${data.backtestId}: ${data.progress}%`,
          );
          this.progressCallbacks.forEach((cb) => cb(data));
          break;

        case this.CHANNELS.COMPLETE:
          this.logger.log(
            `Backtest ${data.backtestId} completed with status: ${data.status}`,
          );
          this.completeCallbacks.forEach((cb) => cb(data));
          break;

        case this.CHANNELS.ERROR:
          this.logger.error(
            `Backtest ${data.backtestId} failed: ${data.error}`,
          );
          this.errorCallbacks.forEach((cb) => cb(data));
          break;

        case this.CHANNELS.OPTIMIZATION_PROGRESS:
          this.logger.debug(
            `Optimization progress for ${data.optimizationId}: ${data.progress}%`,
          );
          this.optimizationProgressCallbacks.forEach((cb) => cb(data));
          break;

        case this.CHANNELS.OPTIMIZATION_COMPLETE:
          this.logger.log(`Optimization ${data.optimizationId} completed`);
          this.optimizationCompleteCallbacks.forEach((cb) => cb(data));
          break;

        case this.CHANNELS.WALKFORWARD_PROGRESS:
          this.logger.debug(
            `Walkforward progress for ${data.walkforwardId}: ${data.progress}%`,
          );
          this.walkforwardProgressCallbacks.forEach((cb) => cb(data));
          break;

        case this.CHANNELS.WALKFORWARD_COMPLETE:
          this.logger.log(`Walkforward ${data.walkforwardId} completed`);
          this.walkforwardCompleteCallbacks.forEach((cb) => cb(data));
          break;

        default:
          this.logger.warn(`Unknown channel: ${channel}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to parse message from channel ${channel}:`,
        error,
      );
    }
  }

  /**
   * Publish a backtest task to the analytics server
   */
  async publishTask(task: BacktestTaskMessage): Promise<void> {
    try {
      const message = JSON.stringify({
        ...task,
        timestamp: new Date().toISOString(),
      });

      await this.publisher.publish(this.CHANNELS.TASK, message);
      this.logger.log(`Published backtest task: ${task.backtestId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish task for backtest ${task.backtestId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Publish an optimization task to the analytics server (NEW)
   * Analytics server will generate combinations and run backtests in parallel
   */
  async publishOptimizationTask(task: OptimizationTaskMessage): Promise<void> {
    try {
      const message = JSON.stringify({
        ...task,
        timestamp: new Date().toISOString(),
      });

      await this.publisher.publish(this.CHANNELS.OPTIMIZATION_TASK, message);
      this.logger.log(`Published optimization task: ${task.optimizationId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish optimization task ${task.optimizationId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Publish a walk-forward analysis task to the analytics server (NEW)
   * Analytics server will generate windows and run train/test in parallel
   */
  async publishWalkForwardTask(task: any): Promise<void> {
    try {
      const message = JSON.stringify({
        ...task,
        timestamp: new Date().toISOString(),
      });

      await this.publisher.publish(this.CHANNELS.WALKFORWARD_TASK, message);
      this.logger.log(`Published walk-forward task: ${task.analysisId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish walk-forward task ${task.analysisId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Register a callback for progress updates
   */
  onProgress(callback: (data: BacktestProgressMessage) => void) {
    this.progressCallbacks.push(callback);
  }

  /**
   * Register a callback for completion events
   */
  onComplete(callback: (data: BacktestCompleteMessage) => void) {
    this.completeCallbacks.push(callback);
  }

  /**
   * Register a callback for error events
   */
  onError(callback: (data: BacktestCompleteMessage) => void) {
    this.errorCallbacks.push(callback);
  }

  /**
   * Register a callback for optimization progress
   */
  onOptimizationProgress(callback: (data: any) => void) {
    this.optimizationProgressCallbacks.push(callback);
  }

  /**
   * Register a callback for optimization completion
   */
  onOptimizationComplete(callback: (data: any) => void) {
    this.optimizationCompleteCallbacks.push(callback);
  }

  /**
   * Register a callback for walkforward progress
   */
  onWalkforwardProgress(callback: (data: any) => void) {
    this.walkforwardProgressCallbacks.push(callback);
  }

  /**
   * Register a callback for walkforward completion
   */
  onWalkforwardComplete(callback: (data: any) => void) {
    this.walkforwardCompleteCallbacks.push(callback);
  }

  /**
   * Clean up Redis connections on module destroy
   */
  async onModuleDestroy() {
    await this.publisher.quit();
    await this.subscriber.quit();
    this.logger.log('Redis connections closed');
  }
}
