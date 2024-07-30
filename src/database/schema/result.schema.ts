import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ILeveragedPerformance, LeveragedPerformance, LeveragedPerformanceSchema } from './resultSchema/leveragedPerformance.schema';
import { IPerformance, Performance, PerformanceSchema } from './resultSchema/performance.schema';

export interface IResult {
  strategyName: string;
  performance: IPerformance;
  leveragedPerformance: ILeveragedPerformance;
}

@Schema({ timestamps: true })
export class Result extends Document implements IResult {
  @Prop({ required: true, type: String})
  strategyName: string;

  @Prop({ required: true, type: PerformanceSchema })
  performance: Performance;

  @Prop({ required: true, type: LeveragedPerformanceSchema })
  leveragedPerformance: LeveragedPerformance;
}

export const ResultSchema = SchemaFactory.createForClass<IResult>(Result);
