import { MongooseModule } from "@nestjs/mongoose";
import { Strategy } from "passport-local";
import { StrategySchema, Result, ResultSchema, Market, MarketSchema } from "./schema";
import { Module } from "@nestjs/common";
import { ResultSchemaRepository } from "./repository/result.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Strategy.name, schema: StrategySchema },
            { name: Result.name, schema: ResultSchema },
            { name: Market.name, schema: MarketSchema },
        ])
    ],
    providers: [ResultSchemaRepository],
    exports: [MongooseModule, ResultSchemaRepository]
})
export class DatabaseModule {}