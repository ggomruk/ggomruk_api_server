import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { ConfigModule } from '@nestjs/config';
import { RedisMessageQueueModule } from '../../redis/messageQueue/redis.mq.module';
import { Backtest, BacktestSchema } from './schemas/backtest.schema';

@Module({
  imports: [
    ConfigModule, 
    RedisMessageQueueModule,
    MongooseModule.forFeature([{ name: Backtest.name, schema: BacktestSchema }])
  ],
  controllers: [BacktestController],
  providers: [BacktestService],
  exports: [BacktestService],
})
export class BacktestModule {}
