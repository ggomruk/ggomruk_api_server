import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { ConfigModule } from '@nestjs/config';
import { RedisMessageQueueModule } from '../../redis/messageQueue/redis.mq.module';
import { BacktestSchema } from './schemas/backtest.schema';
import { WebsocketModule } from '../../websocket/websocket.module';
import { BacktestSchemaRepository } from './backtest.repository';

@Module({
  imports: [
    ConfigModule,
    RedisMessageQueueModule,
    forwardRef(() => WebsocketModule),
    MongooseModule.forFeature([{ name: 'Backtest', schema: BacktestSchema }]),
  ],
  controllers: [BacktestController],
  providers: [BacktestService, BacktestSchemaRepository],
  exports: [BacktestService],
})
export class BacktestModule {}
