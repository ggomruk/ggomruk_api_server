import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IStrategies, StrategiesDocument, StrategiesSchema } from "./strategeisSchema/strategies.schema";
import mongoose, { Document } from 'mongoose';

export interface IBacktestParams {
    symbol: string;
    startDate: Date;
    endDate: Date;
    commission: number;
    usdt: string;
    leverage: string;
    interval: string;
    strategies: IStrategies;
}
    
@Schema({ timestamps: false })
export class BacktestParamsDocument extends Document implements IBacktestParams {
    @Prop({ required: true, type: String })
    symbol: string;

    @Prop({ required: true, type: Date })
    startDate: Date;

    @Prop({ required: true, type: Date })
    endDate: Date;

    @Prop({ required: true, type: Number })
    commission: number;

    @Prop({ required: true, type: String })
    usdt: string;

    @Prop({ required: true, type: String })
    leverage: string;

    @Prop({ required: true, type: String })
    interval: string;

    @Prop({ required: true, type: StrategiesSchema })
    strategies: StrategiesDocument;
}

export const BacktestParamsSchema = SchemaFactory.createForClass<IBacktestParams>(BacktestParamsDocument);

export const BacktestModel = mongoose.model<BacktestParamsDocument>('BacktestParams', BacktestParamsSchema);
