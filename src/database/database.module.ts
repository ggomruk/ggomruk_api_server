import { MongooseModule } from "@nestjs/mongoose";
import { Strategy } from "passport-local";
import { BacktestDocument, BacktestSchema, Market, MarketSchema } from "./schema";
import { Module } from "@nestjs/common";
import { BacktestSchemaRepository } from "./repository/backtest.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: BacktestDocument.name, schema: BacktestSchema },
            { name: Market.name, schema: MarketSchema },
        ])
    ],
    providers: [BacktestSchemaRepository],
    exports: [MongooseModule]
})
export class DatabaseModule {}