import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ILeveragedPerformance, LeveragedPerformanceDocument, LeveragedPerformanceSchema } from './resultSchema/leveragedPerformance.schema';
import { IPerformance, PerformanceDocument, PerformanceSchema } from './resultSchema/performance.schema';

export interface IResult {
  strategyName: string;
  performance: IPerformance;
  leveragedPerformance: ILeveragedPerformance;
}

@Schema({ timestamps: true, _id: false })
export class ResultDocument extends Document implements IResult {
  @Prop({ required: true, type: String})
  strategyName: string;

  @Prop({ required: true, type: PerformanceSchema })
  performance: PerformanceDocument;

  @Prop({ required: true, type: LeveragedPerformanceSchema })
  leveragedPerformance: LeveragedPerformanceDocument;
}

export const ResultSchema = SchemaFactory.createForClass(ResultDocument);

export const ResultModel = mongoose.model<ResultDocument>('Result', ResultSchema);
