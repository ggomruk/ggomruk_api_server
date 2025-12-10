import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IResult } from "../schema/result.schema";
import { BacktestDocument, IBacktest } from "../schema/backtest.schema";

@Injectable()
export class BacktestSchemaRepository {
    private readonly logger = new Logger(BacktestSchemaRepository.name);

    constructor(
        @InjectModel('Backtest') private readonly backtestModel: Model<BacktestDocument>,
    ) {}

    async findByUid(uid: string): Promise<BacktestDocument> {
        const query = { uid };
        const result = await this.backtestModel.findOne(query);
        return result;
    }

    async insertData(data: IBacktest) {
        const result = await this.backtestModel.create(data);
        return result
    }

    async upsertData(data: IBacktest) {
        const query = {uid: data.uid};
        const update = { $set: data };
        const options = { upsert: true, new: true };
        const result = await this.backtestModel.findOneAndUpdate(
            query,
            update,
            options,
        );
        return result;
    }

    async findByUserId(userId: string, limit: number = 50): Promise<BacktestDocument[]> {
        const query = { uid: userId };
        const result = await this.backtestModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit);
        return result;
    }

    async findById(backtestId: string): Promise<BacktestDocument> {
        const result = await this.backtestModel.findById(backtestId);
        return result;
    }

    async deleteById(backtestId: string): Promise<boolean> {
        const result = await this.backtestModel.findByIdAndDelete(backtestId);
        return !!result;
    }
}