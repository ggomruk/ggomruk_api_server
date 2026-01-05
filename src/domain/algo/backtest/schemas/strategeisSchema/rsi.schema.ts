import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export interface I_RSI {
  rsi_period: number;
  oversold: number;
  overbought: number;
}

@Schema({ timestamps: false, _id: false })
export class RSIDocument extends Document implements I_RSI {
  @Prop({ required: true, type: Number })
  rsi_period: number;

  @Prop({ required: true, type: Number })
  oversold: number;

  @Prop({ required: true, type: Number })
  overbought: number;
}

export const RSISchema = SchemaFactory.createForClass(RSIDocument);
export const RSIModel = mongoose.model<RSIDocument>('RSI', RSISchema);
