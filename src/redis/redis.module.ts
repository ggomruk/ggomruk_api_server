import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from './redis.config';
import { redisClientFactory } from './redis.factory';
import { RedisRepoistory } from './redis.repository';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [redisClientFactory, RedisRepoistory, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
