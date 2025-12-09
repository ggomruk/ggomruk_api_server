import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from 'mongoose';

export interface I_BB {
    sma: number;
    dev: number;
  }

@Schema({timestamps: false, _id: false})
export class BBDocument extends Document implements I_BB {
    @Prop({ required: true, type: Number })
    sma: number;

    @Prop({ required: true, type: Number })
    dev: number;
}

export const BBSchema = SchemaFactory.createForClass(BBDocument);
export const BBModel = mongoose.model<BBDocument>('BB', BBSchema);
