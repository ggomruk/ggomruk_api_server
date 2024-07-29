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
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Strategy.name, schema: StrategySchema },
      { name: Result.name, schema: ResultSchema },
      { name: Market.name, schema: MarketSchema },
    ]),
    ClientsModule.register([
      {
        name: 'ALGO_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        },
      },
    ]),
    RedisModule,
  ],
  controllers: [AlgoController],
  providers: [AlgoService],
})
export class AlgoModule {}
