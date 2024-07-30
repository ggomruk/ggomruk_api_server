import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IResult } from "../schema/result.schema";
import { IBacktest } from "../schema/backtest.schema";

@Injectable()
export class BacktestSchemaRepository {
    private readonly logger = new Logger(BacktestSchemaRepository.name);

    constructor(
        @InjectModel('BacktestDocument') private readonly backtestModel: Model<IBacktest>
    ) {}

    async getData(uid: string): Promise<IBacktest> {
        const query = { uid };
        const result = await this.backtestModel.findOne(query);
        return result;
    }

    async insertData(data: IBacktest) {
        const query = {};
        const update = { $set: data };
        const options = { upsert: true, new: true };
        const result = await this.backtestModel.findOneAndUpdate(
            query,
            update,
            options,
        );
        return result;
    }
}