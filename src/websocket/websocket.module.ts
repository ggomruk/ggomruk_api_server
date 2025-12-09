import { Module } from '@nestjs/common';
import { WebsocketClientService } from './websocketClient.service';
import { WebsocketGateway } from './websocketGateway';
import { ConfigurableModuleClass } from './websocket.moduleDefinition';
import { RedisMessageQueueModel } from 'src/redis/messageQueue/redis.mq.module';

@Module({
  imports: [RedisMessageQueueModel],
  providers: [
    WebsocketGateway,
    WebsocketClientService,
  ],
  exports: [WebsocketClientService, WebsocketGateway],
})
export class WebsocketModule extends ConfigurableModuleClass {}
