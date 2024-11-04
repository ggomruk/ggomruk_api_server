import { Module } from '@nestjs/common';
import { AlgoController } from './algo.controller';
import { AlgoService } from './algo.service';
import { DatabaseModule } from 'src/database/database.module';
import { RedisModule } from 'src/redis/redis.module';
import RedisMessageQueueClient from 'src/redis/messageQueue/redis.mq.client';

@Module({
  imports: [
    DatabaseModule,
    RedisModule
  ],
  controllers: [AlgoController],
  providers: [AlgoService, RedisMessageQueueClient],
})
export class AlgoModule {}
