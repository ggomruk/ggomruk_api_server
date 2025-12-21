import { Module } from '@nestjs/common';
import { AlgoController } from './algo.controller';
import { AlgoService } from './algo.service';
import { DatabaseModule } from 'src/database/database.module';
import { RedisModule } from 'src/redis/redis.module';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { BacktestModule } from './backtest/backtest.module';

/**
 * 📊 AlgoModule - Trading Algorithm & Backtest APIs
 * 
 * @description Handles backtest job submission and trading signal generation
 * 
 * @controllers
 * - AlgoController: POST /algo/backtest, /algo/signal
 * 
 * @services
 * - AlgoService: Backtest/signal job orchestration
 * - BacktestService: MongoDB operations (from DatabaseModule)
 * - BacktestPubSubService: Redis Pub/Sub communication (from RedisModule)
 * - WebsocketGateway: Real-time progress updates (from WebsocketModule)
 * 
 * @dataFlow
 * Client → AlgoController → AlgoService → Redis Pub/Sub → Python Analytics
 *                               ↓
 *                         MongoDB (params)
 *                               ↓
 *                         WebSocket (progress)
 * 
 * @dependencies
 * - DatabaseModule: Required for backtest persistence
 * - RedisModule: Required for Pub/Sub with Python analytics server
 * - WebsocketModule: Required for real-time progress updates
 */
@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    WebsocketModule,
    BacktestModule,
  ],
  controllers: [AlgoController],
  providers: [AlgoService],
})
export class AlgoModule {}
