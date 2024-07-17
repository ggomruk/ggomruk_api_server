import { Module } from '@nestjs/common';
import { AlgoController } from './algo.controller';
import { AlgoService } from './algo.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StrategySchema,
  Strategy,
  ResultSchema,
  Result,
  MarketSchema,
  Market,
} from './schema';
import { WebsocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Strategy.name, schema: StrategySchema },
      { name: Result.name, schema: ResultSchema },
      { name: Market.name, schema: MarketSchema },
    ]),
    WebsocketModule,
  ],
  controllers: [AlgoController],
  providers: [AlgoService],
})
export class AlgoModule {}
