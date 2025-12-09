import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocketGateway';
import { RedisMessageQueueModel } from 'src/redis/messageQueue/redis.mq.module';

@Module({
  imports: [RedisMessageQueueModel],
  providers: [
    WebsocketGateway,
  ],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
