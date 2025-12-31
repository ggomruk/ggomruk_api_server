import { Module } from '@nestjs/common';
import { RedisCacheModule } from './cache/redis.cache.module';
import { RedisMessageQueueModule } from './messageQueue/redis.mq.module';

/**
 * RedisModule - Central module for all Redis functionality
 * 
 * This module provides:
 * - RedisCacheModule: General caching operations (get/set/delete)
 * - RedisMessageQueueModule: Pub/Sub for backtest communication
 * 
 * All Redis connections are now shared via redis.provider.ts
 * Total connections: 3 (Publisher, Subscriber, Cache Client)
 */
@Module({
  imports: [
    RedisCacheModule,
    RedisMessageQueueModule
  ],
  controllers: [],
  exports: [
    RedisCacheModule,
    RedisMessageQueueModule
  ],
})
export class RedisModule {}
