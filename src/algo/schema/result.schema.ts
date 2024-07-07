import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

interface IResult extends Document {
  strategyReturn: number;
  buyHoldReturn: number;
  cagr: number;
  leveragedReturn: number;
  sharpeRatio: number;
  tradesCount: number;
  testStart: Date;
  testEnd: Date;
}

@Schema({ timestamps: true })
export class ResultSchema extends Document {
  @Prop({ required: true, type: Number })
  strategyReturn: number;

  @Prop({ required: true, type: Number })
  buyHoldReturn: number;

  @Prop({ required: true, type: Number })
  cagr: number;

  @Prop({ required: true, type: Number })
  leveragedReturn: number;

  @Prop({ required: true, type: Number })
  sharpeRatio: number;

  @Prop({ required: true, type: Number })
  tradesCount: number;

  @Prop({ required: true, type: Date })
  testStart: Date;

  @Prop({ required: true, type: Date })
  testEnd: Date;
}

export const Result = SchemaFactory.createForClass<IResult>(ResultSchema);
