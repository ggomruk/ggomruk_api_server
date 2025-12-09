import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from 'mongoose';

export interface I_MACD {
    ema_s: number;
    ema_l: number;
    signal_mw: number;
}

@Schema({timestamps: false, _id: false})
export class MACDDocument extends Document implements I_MACD {
    @Prop({ required: true, type: Number })
    ema_s: number;

    @Prop({ required: true, type: Number })
    ema_l: number;

    @Prop({ required: true, type: Number })
    signal_mw: number;
}

export const MACDSchema = SchemaFactory.createForClass(MACDDocument);
export const MACDModel = mongoose.model<MACDDocument>('MACD', MACDSchema);
