import { MongooseModule } from "@nestjs/mongoose";
import { BacktestDocument, BacktestSchema, Market, MarketSchema } from "./schema";
import { Module } from "@nestjs/common";
import { BacktestSchemaRepository } from "./repository/backtest.repository";
import { BacktestService } from "./service/backtest.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: BacktestDocument.name, schema: BacktestSchema },
            { name: Market.name, schema: MarketSchema },
        ])
    ],
    providers: [BacktestService, BacktestSchemaRepository],
    exports: [BacktestService],
})
export class DatabaseModule {}