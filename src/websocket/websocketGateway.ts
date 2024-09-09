import { MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

// Gateway for Websocket to connect between client 
@WebSocketGateway(5678, {
    namespace: 'ws',
    transports: ['websocket'],
    allowEIO3: true,
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})
export class WebsocketGateway {

    @SubscribeMessage('backtest')
    handleBactestEvent(@MessageBody() data: string) : string {
        return "";
    }

    @SubscribeMessage('signal')
    handleSignalEvent(@MessageBody() data: string) : string {
        return "";
    }
  
}