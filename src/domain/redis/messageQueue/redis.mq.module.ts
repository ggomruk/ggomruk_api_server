import { Module } from '@nestjs/common';
import RedisMessageQueueClient from './redis.mq.client';
import { BacktestPubSubService } from './backtest-pubsub.service';
import { RedisProviders } from '../redis.provider';

@Module({
  imports: [],
  providers: [
    ...RedisProviders,
    RedisMessageQueueClient,
    BacktestPubSubService,
  ],
  exports: [RedisMessageQueueClient, BacktestPubSubService],
})
export class RedisMessageQueueModule {}
