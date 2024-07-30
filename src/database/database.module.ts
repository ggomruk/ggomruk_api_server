import { MongooseModule } from "@nestjs/mongoose";
import { Strategy } from "passport-local";
import { Backtest, BacktestSchema, Result, ResultSchema, Market, MarketSchema } from "./schema";
import { Module } from "@nestjs/common";
import { ResultSchemaRepository } from "./repository/result.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Backtest.name, schema: BacktestSchema },
            { name: Market.name, schema: MarketSchema },
        ])
    ],
    providers: [],
    exports: [MongooseModule]
})
export class DatabaseModule {}