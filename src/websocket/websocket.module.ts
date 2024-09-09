import { Module } from '@nestjs/common';
import { WebsocketClientService } from './websocketClient.service';
import { WebsocketGateway } from './websocketGateway';
import { ConfigurableModuleClass } from './websocket.moduleDefinition';

@Module({
  providers: [
    WebsocketClientService,
    // WebsocketGateway
  ],
  exports: [WebsocketClientService],
})
export class WebsocketModule extends ConfigurableModuleClass {}
