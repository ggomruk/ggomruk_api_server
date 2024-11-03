import { Logger } from "@nestjs/common";
import { 
    MessageBody, 
    SubscribeMessage, 
    WebSocketGateway, 
    OnGatewayInit, 
    OnGatewayConnection, 
    OnGatewayDisconnect, 
    ConnectedSocket
} from "@nestjs/websockets";
import { Server, WebSocketServer } from "ws";

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
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger: Logger = new Logger(WebsocketGateway.name);
    
    afterInit(server: any) {
        this.logger.log("Websocket Gatewway Initialized");
    }

    handleConnection(client: any, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    
    handleDisconnect(client: any) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('backtest')
    handleBactestEvent(@MessageBody() data: string, @ConnectedSocket() client): string {
        console.log(data);
        return "";
    }

    @SubscribeMessage('signal')
    handleSignalEvent(@MessageBody() data: string): string {
        console.log(data);
        return "";
    }

}