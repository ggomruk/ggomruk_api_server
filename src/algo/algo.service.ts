import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BacktestDTO } from './dto/backtest.dto';
import { v4 as uuidv4 } from 'uuid';
import { E_Task } from './enum/task';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AlgoService implements OnModuleInit {
  private readonly logger = new Logger(AlgoService.name);

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    // this.redisService.subscribeBacktestResult(
    //   'backtest',
    //   this.handleBacktestResult.bind(this),
    // );
  }

  async runBacktest(data: BacktestDTO) {
    const task = E_Task.BACKTEST;
    const uid = uuidv4();

    await this.redisService.publishBacktestData(
      'backtest',
      JSON.stringify({ task, uid, data }),
    );

    try {
      return uid;
    } catch (error) {
      this.logger.error(`Error while sending backtest data: ${error.message}`);
      // ex: timeout, websocket error
    }
  }

  handleBacktestResult(message: string) {
    this.logger.log(`Received backtest result: ${message}`);
  }
}
