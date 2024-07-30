import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BacktestParams, BacktestParamsSchema, IBacktestParams } from "./backtestParams.schema";
import { Document } from 'mongoose';
import { IResult, Result, ResultSchema } from "./result.schema";

interface IBacktest {
    uid: string;
    backtestParams: IBacktestParams;
    result: IResult;
}

@Schema({timestamps: true})
export class Backtest extends Document implements IBacktest {
    @Prop({ required: true, type: String})
    uid: string;

    @Prop({ required: true, type: BacktestParamsSchema})
    backtestParams: BacktestParams;
    
    @Prop({ required: false, type: ResultSchema})
    result: Result;
}

export const BacktestSchema = SchemaFactory.createForClass<IBacktest>(Backtest);
