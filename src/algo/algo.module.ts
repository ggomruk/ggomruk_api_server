import { Module } from '@nestjs/common';
import { AlgoController } from './algo.controller';
import { AlgoService } from './algo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StrategySchema, Strategy } from './schema/strategy.schema';
import { ResultSchema, Result } from './schema/result.schema';
import { MarketSchema, Market } from './schema/market.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Strategy.name, schema: StrategySchema },
      { name: Result.name, schema: ResultSchema },
      { name: Market.name, schema: MarketSchema },
    ]),
  ],
  controllers: [AlgoController],
  providers: [AlgoService],
})
export class AlgoModule {}
