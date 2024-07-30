import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export interface I_BB {
    sma: number;
    dev: number;
  }

@Schema({timestamps: false})
export class BB extends Document implements I_BB {
    @Prop({ required: true, type: Number })
    sma: number;

    @Prop({ required: true, type: Number })
    dev: number;
}

export const BBSchema = SchemaFactory.createForClass<I_BB>(BB);