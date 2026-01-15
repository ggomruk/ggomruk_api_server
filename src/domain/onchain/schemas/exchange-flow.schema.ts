import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BlockchainType } from './whale-transaction.schema';

export type ExchangeFlowDocument = ExchangeFlow & Document;

/**
 * Aggregated exchange inflow/outflow data
 * Stored hourly for trend analysis
 */
@Schema({ timestamps: true, collection: 'exchange_flows' })
export class ExchangeFlow {
  @Prop({ required: true, index: true })
  exchange: string; // e.g., 'binance', 'coinbase'

  @Prop({ required: true, enum: BlockchainType, index: true })
  blockchain: BlockchainType;

  @Prop({ required: true })
  symbol: string; // e.g., 'BTC', 'ETH'

  @Prop({ required: true, index: true })
  timestamp: Date; // Hourly bucket timestamp

  @Prop({ default: 0 })
  inflowAmount: number; // Total inflow in native units

  @Prop({ default: 0 })
  inflowUsd: number; // Total inflow in USD

  @Prop({ default: 0 })
  inflowCount: number; // Number of inflow transactions

  @Prop({ default: 0 })
  outflowAmount: number; // Total outflow in native units

  @Prop({ default: 0 })
  outflowUsd: number; // Total outflow in USD

  @Prop({ default: 0 })
  outflowCount: number; // Number of outflow transactions

  @Prop({ default: 0 })
  netFlowAmount: number; // inflow - outflow (positive = more deposits)

  @Prop({ default: 0 })
  netFlowUsd: number;
}

export const ExchangeFlowSchema = SchemaFactory.createForClass(ExchangeFlow);

// Compound unique index for hourly buckets
ExchangeFlowSchema.index(
  { exchange: 1, blockchain: 1, symbol: 1, timestamp: 1 },
  { unique: true },
);
ExchangeFlowSchema.index({ timestamp: -1 });
ExchangeFlowSchema.index({ netFlowUsd: -1 });
