import { Injectable, Logger } from '@nestjs/common';
import { BacktestDTO } from './dto/backtest.dto';
import { v4 as uuidv4 } from 'uuid';
import { E_Task } from './enum/task';
import { RedisService } from 'src/redis/redis.service';
import { BacktestService } from 'src/database/service/backtest.service';
import { IBacktestParams } from 'src/database/schema/backtestParams.schema';
import { AlgoException, AlgoExceptionCode } from './algo.exception';

@Injectable()
export class AlgoService {
  private readonly logger = new Logger(AlgoService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly backtestService: BacktestService
  ) {}

  async runBacktest(data: BacktestDTO) {
    const uid = uuidv4();
    let backtestParams : IBacktestParams = data.toBacktestParams();

    // Insert backtest data if not exists
    let res = await this.backtestService.saveWithUidAndBacktestParams(uid, backtestParams);
    if (!res) {
      this.logger.error(`Failed to save backtest data: ${uid}`);
      throw new AlgoException(AlgoExceptionCode.DUPLICATE_UID, 'Duplicate backtest exists');
    }
    
    try {
      // publish data to 'backtest' channel
      const task = E_Task.BACKTEST;
      await this.redisService.publishBacktestData(
        E_Task.BACKTEST,
        JSON.stringify({ task, uid, data }),
      );
    } catch (error) {
      this.logger.error(`Error while sending backtest data: ${error.message}`);
      throw new Error(`Error while sending backtest data: ${error.message}`);
    }

    return uid;
  }

  async registerSignal() {}
}
