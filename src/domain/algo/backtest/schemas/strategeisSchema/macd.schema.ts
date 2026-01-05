import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export interface I_MACD {
  fast: number;
  slow: number;
  signal: number;
}

@Schema({ timestamps: false, _id: false })
export class MACDDocument extends Document implements I_MACD {
  @Prop({ required: true, type: Number })
  fast: number;

  @Prop({ required: true, type: Number })
  slow: number;

  @Prop({ required: true, type: Number })
  signal: number;
}

export const MACDSchema = SchemaFactory.createForClass(MACDDocument);
export const MACDModel = mongoose.model<MACDDocument>('MACD', MACDSchema);
