import { Module, forwardRef } from '@nestjs/common';
import { WebsocketGateway } from './websocketGateway';
import { RedisModule } from 'src/domain/redis/redis.module';
import { BacktestModule } from '../algo/backtest/backtest.module';

/**
 * 🔌 WebsocketModule - Real-time communication via Socket.IO
 *
 * @description Handles WebSocket connections for real-time backtest updates
 *
 * @gateway
 * - WebsocketGateway: Socket.IO gateway on port 5678
 *
 * @events
 * - backtest:subscribe: Client subscribes to backtest updates
 * - backtest:unsubscribe: Client unsubscribes
 * - backtest:progress: Server sends progress updates
 * - backtest:complete: Server sends completion event
 * - backtest:error: Server sends error event
 *
 * @dependencies
 * - RedisModule: Required for BacktestPubSubService (Redis Pub/Sub)
 * - BacktestModule: Required for updating backtest results in MongoDB
 */
@Module({
  imports: [RedisModule, forwardRef(() => BacktestModule)],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
