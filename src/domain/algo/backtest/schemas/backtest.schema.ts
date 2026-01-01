import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BacktestDocument = Backtest & Document;

@Schema({ timestamps: true, collection: 'backtestResults' })
export class Backtest {
  @Prop({ required: true, unique: true })
  backtestId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: Object })
  params: any;

  @Prop({ type: Object })
  result: any;

  @Prop({ required: true })
  status: string;
}

export const BacktestSchema = SchemaFactory.createForClass(Backtest);
