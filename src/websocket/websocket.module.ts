import { Module } from '@nestjs/common';
import { WebsocketClientService } from './websocketClient.service';

@Module({
  providers: [WebsocketClientService],
  exports: [WebsocketClientService],
})
export class WebsocketModule {}
