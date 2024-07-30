import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export interface I_RV {
    return_thresh_low: number;
    return_thresh_high: number;
    volume_thresh_low: number;
    volume_thresh_high: number;
}

@Schema({timestamps: false})
export class RV extends Document implements I_RV {
    @Prop({ required: true, type: Number })
    return_thresh_low: number;

    @Prop({ required: true, type: Number })
    return_thresh_high: number;

    @Prop({ required: true, type: Number })
    volume_thresh_low: number;

    @Prop({ required: true, type: Number })
    volume_thresh_high: number;
}

export const RVSchema = SchemaFactory.createForClass<I_RV>(RV);