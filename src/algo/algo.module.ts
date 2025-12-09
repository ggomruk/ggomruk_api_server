import { Module } from '@nestjs/common';
import { AlgoController } from './algo.controller';
import { AlgoService } from './algo.service';
import { DatabaseModule } from 'src/database/database.module';
import { RedisModule } from 'src/redis/redis.module';
import RedisMessageQueueClient from 'src/redis/messageQueue/redis.mq.client';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { RedisMessageQueueModel } from 'src/redis/messageQueue/redis.mq.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    RedisMessageQueueModel,
    WebsocketModule
  ],
  controllers: [AlgoController],
  providers: [AlgoService, RedisMessageQueueClient],
})
export class AlgoModule {}
