import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface BacktestTaskMessage {
  backtestId: string;
  userId: string;
  params: {
    symbol: string;
    interval: string;
    startDate: string;
    endDate: string;
    strategies: string[];
    strategyParams: any;
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
  private publisher: Redis;
  private subscriber: Redis;

  // Channel names
  private readonly CHANNELS = {
    TASK: 'backtest:task',
    PROGRESS: 'backtest:progress',
    COMPLETE: 'backtest:complete',
    ERROR: 'backtest:error',
  };

  // Event callbacks
  private progressCallbacks: ((data: BacktestProgressMessage) => void)[] = [];
  private completeCallbacks: ((data: BacktestCompleteMessage) => void)[] = [];
  private errorCallbacks: ((data: BacktestCompleteMessage) => void)[] = [];

  constructor(private configService: ConfigService) {
    const redisConfig = this.configService.get('redis');
    
    // Debug: Log Redis configuration
    console.log('Redis Config:', {
      host: redisConfig.host,
      port: redisConfig.port,
      hasPassword: !!redisConfig.password,
      passwordLength: redisConfig.password?.length || 0,
      password: redisConfig.password
    });
    
    // Build Redis options - only include password if it exists
    const redisOptions: any = {
      host: redisConfig.host,
      port: redisConfig.port,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };
    
    // Only add password if it's not empty
    if (redisConfig.password && redisConfig.password.trim() !== '') {
      redisOptions.password = redisConfig.password;
    }
    
    // Create separate connections for pub and sub
    this.publisher = new Redis(redisOptions);
    this.subscriber = new Redis(redisOptions);

    this.setupErrorHandlers();
  }

  async onModuleInit() {
    await this.subscribeToChannels();
    this.logger.log('BacktestPubSubService initialized and subscribed to channels');
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
      );

      this.subscriber.on('message', (channel, message) => {
        this.handleMessage(channel, message);
      });

      this.logger.log(`Subscribed to channels: ${Object.values(this.CHANNELS).join(', ')}`);
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
          this.logger.debug(`Progress update for backtest ${data.backtestId}: ${data.progress}%`);
          this.progressCallbacks.forEach(cb => cb(data));
          break;
          
        case this.CHANNELS.COMPLETE:
          this.logger.log(`Backtest ${data.backtestId} completed with status: ${data.status}`);
          this.completeCallbacks.forEach(cb => cb(data));
          break;
          
        case this.CHANNELS.ERROR:
          this.logger.error(`Backtest ${data.backtestId} failed: ${data.error}`);
          this.errorCallbacks.forEach(cb => cb(data));
          break;
          
        default:
          this.logger.warn(`Unknown channel: ${channel}`);
      }
    } catch (error) {
      this.logger.error(`Failed to parse message from channel ${channel}:`, error);
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
      this.logger.error(`Failed to publish task for backtest ${task.backtestId}:`, error);
      throw error;
    }
  }

  /**
   * Register a callback for progress updates
   */
  onProgress(callback: (data: BacktestProgressMessage) => void): void {
    this.progressCallbacks.push(callback);
  }

  /**
   * Register a callback for completion events
   */
  onComplete(callback: (data: BacktestCompleteMessage) => void): void {
    this.completeCallbacks.push(callback);
  }

  /**
   * Register a callback for error events
   */
  onError(callback: (data: BacktestCompleteMessage) => void): void {
    this.errorCallbacks.push(callback);
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
