import { Module } from '@nestjs/common';
import { AlgoController } from './algo.controller';
import { AlgoService } from './algo.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisModule } from 'src/redis/redis.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [AlgoController],
  providers: [AlgoService],
})
export class AlgoModule {}
