import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export interface I_BB {
  period: number;
  std: number;
}

@Schema({ timestamps: false, _id: false })
export class BBDocument extends Document implements I_BB {
  @Prop({ required: true, type: Number })
  period: number;

  @Prop({ required: true, type: Number })
  std: number;
}

export const BBSchema = SchemaFactory.createForClass(BBDocument);
export const BBModel = mongoose.model<BBDocument>('BB', BBSchema);
