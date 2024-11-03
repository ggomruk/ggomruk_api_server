import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisRepoistory } from './cache/redis.repository';
import { RedisService } from './cache/redis.service';
import { DatabaseModule } from 'src/database/database.module';
import { RedisCacheModule } from './cache/redis.cache.module';
import { RedisMessageQueueModel } from './messageQueue/redis.mq.module';

@Module({
  imports: [
    DatabaseModule,
    RedisMessageQueueModel
  ],
  // providers: [RedisRepoistory, RedisService],
  providers: [],
  controllers: [],
  // exports: [RedisService],
})
export class RedisModule {}
