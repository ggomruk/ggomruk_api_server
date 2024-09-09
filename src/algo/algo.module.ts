import { Module } from '@nestjs/common';
import { AlgoController } from './algo.controller';
import { AlgoService } from './algo.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [AlgoController],
  providers: [AlgoService],
})
export class AlgoModule {}
