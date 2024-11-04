import { Module } from '@nestjs/common';
import { RedisService } from './cache/redis.service';
import { DatabaseModule } from 'src/database/database.module';
import { RedisMessageQueueModel } from './messageQueue/redis.mq.module';
import { RedisCacheModule } from './cache/redis.cache.module';

@Module({
  imports: [
    DatabaseModule,
    RedisCacheModule,
    RedisMessageQueueModel
  ],
  controllers: [],
  exports: [],
})
export class RedisModule {}
