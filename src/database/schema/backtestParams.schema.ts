import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IStrategies, StrategiesDocument, StrategiesSchema } from "./strategeisSchema/strategies.schema";
import mongoose, { Document } from 'mongoose';

export interface IBacktestParams {
    symbol: string;
    startDate: Date;
    endDate: Date;
    commission: number;
    usdt: number;
    leverage: number;
    interval: string;
    strategies: IStrategies;
}
    
@Schema({ timestamps: false, _id: false })
export class BacktestParamsDocument extends Document implements IBacktestParams {
    @Prop({ required: true, type: String })
    symbol: string;

    @Prop({ required: true, type: Date })
    startDate: Date;

    @Prop({ required: true, type: Date })
    endDate: Date;

    @Prop({ required: true, type: Number })
    commission: number;

    @Prop({ required: true, type: Number })
    usdt: number;

    @Prop({ required: true, type: Number })
    leverage: number;

    @Prop({ required: true, type: String })
    interval: string;

    @Prop({ required: true, type: StrategiesSchema })
    strategies: StrategiesDocument;
}

export const BacktestParamsSchema = SchemaFactory.createForClass(BacktestParamsDocument);

export const BacktestModel = mongoose.model<BacktestParamsDocument>('BacktestParams', BacktestParamsSchema);
