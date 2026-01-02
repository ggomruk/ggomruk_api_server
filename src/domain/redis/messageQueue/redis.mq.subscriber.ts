import { Injectable } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import RedisBacktestDto from './dto/redis.backtest.dto';
import RedisSignalDto from './dto/redis.signal.dto';

@Injectable()
export class MessageQueueSubscriber {
  // Listen to the 'backtest' message pattern
  @MessagePattern('backtest')
  handleBacktest(data: RedisBacktestDto) {
    console.log('Received backtest request: ', data);
  }

  // Listen to the 'siganal' message pattern
  @MessagePattern('signal')
  handleSignal(data: RedisSignalDto) {
    console.log('Received signal request: ', data);
  }
}
