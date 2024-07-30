import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from 'mongoose';

export interface I_SO {
    periods: number;
    d_mw: number;
}

@Schema({timestamps: false})
export class SODocument extends Document implements I_SO {
    @Prop({ required: true, type: Number })
    periods: number;

    @Prop({ required: true, type: Number })
    d_mw: number;
}

export const SOSchema = SchemaFactory.createForClass<I_SO>(SODocument);
export const SOModel = mongoose.model<SODocument>('SO', SOSchema);
