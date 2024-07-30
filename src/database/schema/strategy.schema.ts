import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StrategyParams } from '../../algo/strategy.type';

interface IStrategyDetail {
  strategyName: string;
  params: StrategyParams;
}

// Document types
interface IStrategy {
  symbol: string;
  startDate: number;
  commission: number;
  usdt: string;
  leverage: string;
  interval: string;
  strategies: StrategyDetail[];
}

@Schema()
export class StrategyDetail {
  @Prop({ required: true })
  strategyName: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  params: StrategyParams;
}

// eslint-disable-next-line prettier/prettier
export const StrategyDetailSchema = SchemaFactory.createForClass<IStrategyDetail>(StrategyDetail);

// Define the main document
@Schema({ timestamps: true })
export class Strategy {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  startDate: number;

  @Prop({ required: true })
  commission: number;

  @Prop({ required: true })
  usdt: string;

  @Prop({ required: true })
  leverage: string;

  @Prop({ required: true })
  interval: string;

  @Prop({ type: [StrategyDetailSchema], required: true, default: [] })
  strategies: StrategyDetail[];
}

export const StrategySchema = SchemaFactory.createForClass<IStrategy>(Strategy);
