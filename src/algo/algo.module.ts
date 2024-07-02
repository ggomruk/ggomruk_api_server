import { Module } from '@nestjs/common';
import { AlgoController } from './algo.controller';
import { AlgoService } from './algo.service';

@Module({
  controllers: [AlgoController],
  providers: [AlgoService],
})
export class AlgoModule {}
