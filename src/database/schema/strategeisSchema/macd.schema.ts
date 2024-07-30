import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export interface I_MACD {
    ema_s: number;
    ema_l: number;
    signal_mw: number;
}

@Schema({timestamps: false})
export class MACD extends Document implements I_MACD {
    @Prop({ required: true, type: Number })
    ema_s: number;

    @Prop({ required: true, type: Number })
    ema_l: number;

    @Prop({ required: true, type: Number })
    signal_mw: number;
}

export const MACDSchema = SchemaFactory.createForClass<I_MACD>(MACD);