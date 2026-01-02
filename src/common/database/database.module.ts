import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { BacktestSchema } from "../../domain/algo/backtest/schemas/backtest.schema";
import { MarketSchema } from "../../domain/market/schemas/market.schema";
import { OptimizationTaskSchema, OptimizationTask } from "../../domain/algo/optimizer/schema/optimizationTask.schema";
import { OptimizationResultSchema, OptimizationResult } from "../../domain/algo/optimizer/schema/optimizationResult.schema";
import { SignalSchema } from "../../domain/algo/backtest/schemas/signal.schema";
import { BacktestService } from "../../domain/algo/backtest/backtest.service";
import { OptimizationTaskService } from "../../domain/algo/optimizer/service/optimizationTask.service";
import { OptimizationResultService } from "../../domain/algo/optimizer/service/optimizationResult.service";
import { BacktestSchemaRepository } from "../../domain/algo/backtest/backtest.repository";
import { OptimizationTaskRepository } from "../../domain/algo/optimizer/repository/optimizationTask.repository";
import { OptimizationResultRepository } from "../../domain/algo/optimizer/repository/optimizationResult.repository";
import { RedisMessageQueueModule } from "../../domain/redis/messageQueue/redis.mq.module";
import { WebsocketModule } from "../../domain/websocket/websocket.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "Signal", schema: SignalSchema},
            { name: "Backtest", schema: BacktestSchema },
            { name: "Market", schema: MarketSchema },
            { name: OptimizationTask.name, schema: OptimizationTaskSchema },
            { name: OptimizationResult.name, schema: OptimizationResultSchema },
        ]),
        RedisMessageQueueModule,
        WebsocketModule
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