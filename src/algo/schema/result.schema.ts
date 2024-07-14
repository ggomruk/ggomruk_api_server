import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

interface IResult {
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
export class Result {
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

export const ResultSchema = SchemaFactory.createForClass<IResult>(Result);
