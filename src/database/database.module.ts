import { MongooseModule } from "@nestjs/mongoose";
import { BacktestSchema, MarketSchema, OptimizationTaskSchema, OptimizationTask } from "./schema";
import { Module } from "@nestjs/common";
import { BacktestSchemaRepository } from "./repository/backtest.repository";
import { BacktestService } from "./service/backtest.service";
import { SignalSchema } from "./schema/signal.schema";
import { OptimizationTaskRepository } from "./repository/optimizationTask.repository";
import { OptimizationTaskService } from "./service/optimizationTask.service";
import { OptimizationResultSchema, OptimizationResult } from "./schema/optimizationResult.schema";
import { OptimizationResultRepository } from "./repository/optimizationResult.repository";
import { OptimizationResultService } from "./service/optimizationResult.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "Signal", schema: SignalSchema},
            { name: "Backtest", schema: BacktestSchema },
            { name: "Market", schema: MarketSchema },
            { name: OptimizationTask.name, schema: OptimizationTaskSchema },
            { name: OptimizationResult.name, schema: OptimizationResultSchema },
        ])
    ],
    providers: [
        BacktestService, 
        BacktestSchemaRepository, 
        OptimizationTaskService, 
        OptimizationTaskRepository,
        OptimizationResultService,
        OptimizationResultRepository
    ],
    exports: [BacktestService, OptimizationTaskService, OptimizationResultService],
})
export class DatabaseModule {}