import { Injectable, Logger } from '@nestjs/common';
import { BacktestDTO } from './dto/backtest.dto';
import { v4 as uuidv4 } from 'uuid';
import { E_Task } from './enum/task';
import { BacktestService } from 'src/database/service/backtest.service';
import { IBacktestParams } from 'src/database/schema/backtestParams.schema';
import { AlgoException, AlgoExceptionCode } from './algo.exception';
import { SignalDTO } from './dto/signal.dto';
import RedisMessageQueueClient from 'src/redis/messageQueue/redis.mq.client';

@Injectable()
export class AlgoService {
  private readonly logger = new Logger(AlgoService.name);

  constructor(
    private readonly redisService: RedisMessageQueueClient,
    private readonly backtestService: BacktestService
  ) {}

  async runBacktest(data: BacktestDTO) {
    const uid = uuidv4();
    let backtestParams : IBacktestParams = data.toBacktestParams();

    // Insert backtest data if not exists
    try {
      await this.backtestService.saveWithUidAndBacktestParams(uid, backtestParams);
    } catch (error){
      this.logger.error(`Failed to save backtest data: ${uid}`);
      throw new AlgoException(AlgoExceptionCode.DUPLICATE_UID, 'Duplicate backtest exists');
    }
    
    try {
      // publish data to 'backtest' channel
      const task = E_Task.BACKTEST;
      await this.redisService.publish(
        E_Task.BACKTEST,
        JSON.stringify({ task, uid, data }),
      );
    } catch (error) {
      this.logger.error(`Error while sending backtest data: ${error.message}`);
      throw new Error(error.message);
    }

    return uid;
  }

  async registerSignal(data: SignalDTO) {
    const uid = uuidv4(); 
    let signalParams = data.toSignalParams()
  }
}
