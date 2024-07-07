import { Module } from '@nestjs/common';
import { AlgoController } from './algo.controller';
import { AlgoService } from './algo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StrategySchema } from './schema/strategy.schema';
import { ResultSchema } from './schema/result.schema';
import { MarketSchema } from './schema/market.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Strategy', schema: StrategySchema },
      { name: 'Result', schema: ResultSchema },
      { name: 'Market', schema: MarketSchema },
    ]),
  ],
  controllers: [AlgoController],
  providers: [AlgoService],
})
export class AlgoModule {}
