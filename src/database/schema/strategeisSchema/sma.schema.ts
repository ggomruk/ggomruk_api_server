import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export interface I_SMA {
    sma_s: number;
    sma_m: number;
    sma_l: number;
}

@Schema({timestamps: false})
export class SMA extends Document implements I_SMA {
    @Prop({ required: true, type: Number })
    sma_s: number;

    @Prop({ required: true, type: Number })
    sma_m: number;

    @Prop({ required: true, type: Number })
    sma_l: number;
}

export const SMASchema = SchemaFactory.createForClass<I_SMA>(SMA);