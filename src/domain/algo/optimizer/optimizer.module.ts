import { Module, forwardRef } from '@nestjs/common';
import { OptimizerController } from './optimizer.controller';
import { OptimizerService } from './optimizer.service';
import { DatabaseModule } from 'src/common/database/database.module';
import { RedisModule } from 'src/domain/redis/redis.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OptimizationTaskService } from './service/optimizationTask.service';
import { OptimizationResultService } from './service/optimizationResult.service';
import { OptimizationTaskRepository } from './repository/optimizationTask.repository';
import { OptimizationResultRepository } from './repository/optimizationResult.repository';
import {
  OptimizationTask,
  OptimizationTaskSchema,
} from './schema/optimizationTask.schema';
import {
  OptimizationResult,
  OptimizationResultSchema,
} from './schema/optimizationResult.schema';
import { BacktestModule } from '../backtest/backtest.module';
import { WebsocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    forwardRef(() => WebsocketModule),
    forwardRef(() => BacktestModule),
    MongooseModule.forFeature([
      { name: OptimizationTask.name, schema: OptimizationTaskSchema },
      { name: OptimizationResult.name, schema: OptimizationResultSchema },
    ]),
  ],
  controllers: [OptimizerController],
  providers: [
    OptimizerService,
    OptimizationTaskService,
    OptimizationResultService,
    OptimizationTaskRepository,
    OptimizationResultRepository,
  ],
  exports: [OptimizerService],
})
export class OptimizerModule {}
