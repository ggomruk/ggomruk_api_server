import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BacktestParamsDocument, BacktestParamsSchema, IBacktestParams } from "./backtestParams.schema";
import mongoose, { Document } from 'mongoose';
import { IResult, ResultDocument, ResultSchema } from "./result.schema";

export interface IBacktest {
    uid: string;
    backtestParams: IBacktestParams;
    result?: IResult;
}

@Schema({timestamps: true, collection: 'backtest'})
export class BacktestDocument extends Document implements IBacktest {
    @Prop({ required: true, type: String})
    uid: string;

    @Prop({ required: true, type: BacktestParamsSchema})
    backtestParams: BacktestParamsDocument;
    
    @Prop({ required: false, type: ResultSchema})
    result: ResultDocument;
}

export const BacktestSchema = SchemaFactory.createForClass(BacktestDocument);
BacktestSchema.index({ createdAt: -1 });

export const BacktestModel = mongoose.model<BacktestDocument>('Backtest', BacktestSchema);
