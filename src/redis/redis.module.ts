import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from './redis.config';
import { redisClientFactory } from './redis.factory';
import { RedisRepoistory } from './redis.repository';
import { RedisService } from './redis.service';
import { RedisSubscriberController } from './redis.subscriber';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    ConfigModule.forFeature(redisConfig),
    DatabaseModule,
  ],
  providers: [redisClientFactory, RedisRepoistory, RedisService],
  controllers: [RedisSubscriberController],
  exports: [RedisService],
})
export class RedisModule {}
