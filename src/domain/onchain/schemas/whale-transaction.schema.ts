import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WhaleTransactionDocument = WhaleTransaction & Document;

/**
 * Blockchain types supported
 */
export enum BlockchainType {
  BITCOIN = 'bitcoin',
  ETHEREUM = 'ethereum',
}

/**
 * Transaction direction relative to exchanges
 */
export enum TransactionDirection {
  TO_EXCHANGE = 'to_exchange',
  FROM_EXCHANGE = 'from_exchange',
  UNKNOWN = 'unknown',
}

@Schema({ timestamps: true, collection: 'whale_transactions' })
export class WhaleTransaction {
  @Prop({ required: true, unique: true, index: true })
  txHash: string;

  @Prop({ required: true, enum: BlockchainType, index: true })
  blockchain: BlockchainType;

  @Prop({ required: true, index: true })
  fromAddress: string;

  @Prop({ required: true, index: true })
  toAddress: string;

  @Prop({ type: String })
  fromLabel?: string;

  @Prop({ type: String })
  toLabel?: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  amountUsd: number;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ enum: TransactionDirection, default: TransactionDirection.UNKNOWN })
  direction: TransactionDirection;

  @Prop({ type: Object })
  rawData?: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const WhaleTransactionSchema =
  SchemaFactory.createForClass(WhaleTransaction);

// Indexes for common queries
WhaleTransactionSchema.index({ timestamp: -1 });
WhaleTransactionSchema.index({ blockchain: 1, timestamp: -1 });
WhaleTransactionSchema.index({ amountUsd: -1 });
WhaleTransactionSchema.index({ direction: 1, timestamp: -1 });

// TTL index for data retention (90 days for premium, handled at query level)
// Free tier data cleanup handled by scheduled job
