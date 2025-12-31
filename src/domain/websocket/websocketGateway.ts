import { Logger } from "@nestjs/common";
import { 
    MessageBody, 
    SubscribeMessage, 
    WebSocketGateway, 
    OnGatewayInit, 
    OnGatewayConnection, 
    OnGatewayDisconnect, 
    ConnectedSocket,
    WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { BacktestPubSubService } from "src/domain/redis/messageQueue/backtest-pubsub.service";

// Gateway for Websocket to connect between client 
@WebSocketGateway(5678, {
    namespace: 'ws',
    transports: ['websocket'],
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true
    },
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger: Logger = new Logger(WebsocketGateway.name);
    
    // Map to track user subscriptions: userId -> Set of socket IDs
    private userSockets: Map<string, Set<string>> = new Map();

    constructor(private backtestPubSub: BacktestPubSubService) {
        // Subscribe to Redis events and broadcast to connected clients
        this.setupRedisSubscriptions();
    }
    
    afterInit(server: Server) {
        this.logger.log("Websocket Gateway Initialized on port 5678");
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`✅ Client connected: ${client.id} from ${client.handshake.address}`);
    }
    
    handleDisconnect(client: Socket) {
        // Find which user this socket belonged to
        let userId: string | null = null;
        this.userSockets.forEach((sockets, uid) => {
            if (sockets.has(client.id)) {
                userId = uid;
            }
        });

        this.logger.log(`❌ Client disconnected: ${client.id}${userId ? ` (user: ${userId})` : ''}`);
        
        // Remove client from all user subscriptions
        this.userSockets.forEach((sockets, userId) => {
            sockets.delete(client.id);
            if (sockets.size === 0) {
                this.logger.debug(`No more sockets for user ${userId}`);
                this.userSockets.delete(userId);
            }
        });
    }

    /**
     * Client subscribes to backtest updates for their user ID
     */
    @SubscribeMessage('backtest:subscribe')
    handleBacktestSubscribe(
        @MessageBody() data: { userId: string }, 
        @ConnectedSocket() client: Socket
    ): void {
        const { userId } = data;
        
        if (!userId) {
            this.logger.warn(`Client ${client.id} tried to subscribe without userId`);
            client.emit('error', { message: 'userId is required' });
            return;
        }

        // Add client to user's socket set
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        
        const userSockets = this.userSockets.get(userId);
        if (userSockets) {
            userSockets.add(client.id);
        }

        const totalSockets = userSockets?.size || 0;
        this.logger.log(`📡 Client ${client.id} subscribed to backtest updates for user ${userId} (${totalSockets} total sockets)`);
        client.emit('backtest:subscribed', { userId, socketId: client.id, message: 'Subscribed successfully' });
    }

    /**
     * Client unsubscribes from backtest updates
     */
    @SubscribeMessage('backtest:unsubscribe')
    handleBacktestUnsubscribe(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket
    ): void {
        const { userId } = data;
        
        if (this.userSockets.has(userId)) {
            const userSockets = this.userSockets.get(userId);
            if (userSockets) {
                userSockets.delete(client.id);
                if (userSockets.size === 0) {
                    this.userSockets.delete(userId);
                }
            }
        }

        this.logger.log(`Client ${client.id} unsubscribed from backtest updates for user ${userId}`);
        client.emit('backtest:unsubscribed', { userId });
    }

    /**
     * Setup Redis Pub/Sub subscriptions
     */
    private setupRedisSubscriptions() {
        // Listen for progress updates from Python analytics
        this.backtestPubSub.onProgress((data) => {
            this.logger.debug(`Broadcasting progress for backtest ${data.backtestId}: ${data.progress}%`);
            this.broadcastToUser(data.userId, 'backtest:progress', data);
        });

        // Listen for completion events
        this.backtestPubSub.onComplete((data) => {
            this.logger.log(`Broadcasting completion for backtest ${data.backtestId}`);
            this.broadcastToUser(data.userId, 'backtest:complete', data);
        });

        // Listen for error events
        this.backtestPubSub.onError((data) => {
            this.logger.error(`Broadcasting error for backtest ${data.backtestId}`);
            this.broadcastToUser(data.userId, 'backtest:error', data);
        });

        // Listen for optimization progress
        this.backtestPubSub.onOptimizationProgress((data) => {
            this.logger.debug(`Broadcasting progress for optimization ${data.optimizationId}: ${data.progress}%`);
            this.broadcastToUser(data.userId, 'optimization:progress', data);
        });

        // Listen for optimization completion
        this.backtestPubSub.onOptimizationComplete((data) => {
            this.logger.log(`Broadcasting completion for optimization ${data.optimizationId}`);
            this.broadcastToUser(data.userId, 'optimization:complete', data);
        });

        // Listen for walkforward progress
        this.backtestPubSub.onWalkforwardProgress((data) => {
            this.logger.debug(`Broadcasting progress for walkforward ${data.walkforwardId}: ${data.progress}%`);
            this.broadcastToUser(data.userId, 'walkforward:progress', data);
        });

        // Listen for walkforward completion
        this.backtestPubSub.onWalkforwardComplete((data) => {
            this.logger.log(`Broadcasting completion for walkforward ${data.walkforwardId}`);
            this.broadcastToUser(data.userId, 'walkforward:complete', data);
        });
    }

    /**
     * Broadcast message to all sockets connected for a specific user
     */
    private broadcastToUser(userId: string, event: string, data: any) {
        // Check if server is initialized
        if (!this.server) {
            this.logger.warn(`WebSocket server not initialized, cannot broadcast ${event} to user ${userId}`);
            return;
        }

        const sockets = this.userSockets.get(userId);
        
        if (!sockets || sockets.size === 0) {
            this.logger.debug(`No connected clients for user ${userId} - backtest will continue in background`);
            return;
        }

        // Just emit to all socket IDs - Socket.IO will handle non-existent sockets gracefully
        const socketIds = Array.from(sockets);
        this.logger.log(`📤 Broadcasting ${event} to ${socketIds.length} socket(s) for user ${userId}: [${socketIds.join(', ')}]`);
        
        socketIds.forEach(socketId => {
            try {
                // Socket.IO's to() method handles non-existent sockets gracefully
                this.server.to(socketId).emit(event, data);
            } catch (error) {
                this.logger.error(`❌ Error emitting to socket ${socketId}: ${error.message}`);
            }
        });

        this.logger.log(`✅ Broadcasted ${event} to user ${userId}`);
    }

    /**
     * Public method to emit backtest started event (called from algo service)
     */
    emitBacktestStarted(userId: string, backtestId: string, data: any) {
        this.broadcastToUser(userId, 'backtest:started', {
            backtestId,
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Public method to emit alert triggered event
     */
    emitAlertTriggered(userId: string, data: any) {
        this.broadcastToUser(userId, 'alert:triggered', {
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    // Legacy handlers (keeping for backward compatibility)
    @SubscribeMessage('backtest')
    handleBactestEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
        console.log(data);
        return "";
    }

    @SubscribeMessage('signal')
    handleSignalEvent(@MessageBody() data: string): string {
        console.log(data);
        return "";
    }
}