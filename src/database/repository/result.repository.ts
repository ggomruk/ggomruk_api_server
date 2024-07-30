import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IResult } from "../schema/result.schema";

@Injectable()
export class ResultSchemaRepository {
    private readonly logger = new Logger(ResultSchemaRepository.name);

    constructor(
        @InjectModel('Result') private readonly resultModel: Model<IResult>
    ) {}

    async getData(uid: string): Promise<IResult> {
        const query = { uid };
        const result = await this.resultModel.findOne(query);
        return result;
    }

    async insertData(data: IResult) {
        const query = {};
        const update = { $set: data };
        const options = { upsert: true, new: true };
        const result = await this.resultModel.findOneAndUpdate(
            query,
            update,
            options,
        );
        return result;
    }
}