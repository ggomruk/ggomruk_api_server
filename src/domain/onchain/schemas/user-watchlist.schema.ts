import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BlockchainType } from './whale-transaction.schema';

export type UserWatchlistDocument = UserWatchlist & Document;

/**
 * User watchlist entry for tracking specific addresses
 */
@Schema({ timestamps: true, collection: 'user_watchlists' })
export class UserWatchlist {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  address: string;

  @Prop({ required: true, enum: BlockchainType })
  blockchain: BlockchainType;

  @Prop({ type: String })
  nickname?: string; // User-defined name for the address

  @Prop({ type: String })
  label?: string; // System label if known

  @Prop({ default: 0 })
  alertThresholdUsd: number; // Minimum USD value to trigger alert

  @Prop({ default: true })
  alertEnabled: boolean;

  @Prop({ default: true })
  telegramAlert: boolean;

  @Prop({ default: true })
  inAppAlert: boolean;

  @Prop({ type: Date })
  lastAlertSent?: Date;

  @Prop({ type: String })
  notes?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserWatchlistSchema = SchemaFactory.createForClass(UserWatchlist);

// Compound unique index - user can only track an address once
UserWatchlistSchema.index(
  { userId: 1, address: 1, blockchain: 1 },
  { unique: true },
);
UserWatchlistSchema.index({ address: 1 });
