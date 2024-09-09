import { MongooseModule } from "@nestjs/mongoose";
import { BacktestSchema, MarketSchema } from "./schema";
import { Module } from "@nestjs/common";
import { BacktestSchemaRepository } from "./repository/backtest.repository";
import { BacktestService } from "./service/backtest.service";
import { SignalSchema } from "./schema/signal.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "Signal", schema: SignalSchema},
            { name: "Backtest", schema: BacktestSchema },
            { name: "Market", schema: MarketSchema },
        ])
    ],
    providers: [BacktestService, BacktestSchemaRepository],
    exports: [BacktestService],
})
export class DatabaseModule {}