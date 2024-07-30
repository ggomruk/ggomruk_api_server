import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export interface I_RSI {
    periods: number;
    rsi_upper: number;
    rsi_lower: number;
}

@Schema({timestamps: false})
export class RSI extends Document implements I_RSI {
    @Prop({ required: true, type: Number })
    periods: number;

    @Prop({ required: true, type: Number })
    rsi_upper: number;

    @Prop({ required: true, type: Number })
    rsi_lower: number;
}

export const RSISchema = SchemaFactory.createForClass<I_RSI>(RSI);