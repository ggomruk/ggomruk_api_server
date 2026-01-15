import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BlockchainType } from './whale-transaction.schema';

export type WhaleWalletDocument = WhaleWallet & Document;

/**
 * Wallet type classification
 */
export enum WalletType {
  EXCHANGE = 'exchange',
  WHALE = 'whale',
  INSTITUTION = 'institution',
  UNKNOWN = 'unknown',
}

@Schema({ timestamps: true, collection: 'whale_wallets' })
export class WhaleWallet {
  @Prop({ required: true, index: true })
  address: string;

  @Prop({ required: true, enum: BlockchainType, index: true })
  blockchain: BlockchainType;

  @Prop({ type: String })
  label?: string;

  @Prop({ enum: WalletType, default: WalletType.UNKNOWN })
  walletType: WalletType;

  @Prop({ type: String })
  exchange?: string; // e.g., 'binance', 'coinbase'

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  balanceUsd: number;

  @Prop({ type: Date })
  lastActivity?: Date;

  @Prop({ type: Date })
  lastUpdated?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isKnownAddress: boolean; // Pre-labeled addresses like exchange wallets

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const WhaleWalletSchema = SchemaFactory.createForClass(WhaleWallet);

// Compound unique index
WhaleWalletSchema.index({ address: 1, blockchain: 1 }, { unique: true });
WhaleWalletSchema.index({ walletType: 1 });
WhaleWalletSchema.index({ exchange: 1 });
WhaleWalletSchema.index({ balance: -1 });
