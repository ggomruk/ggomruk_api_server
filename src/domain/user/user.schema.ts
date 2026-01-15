import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
}

export interface IUser {
  username: string;
  email: string;
  displayName?: string;
  picture?: string;
  subscription?: SubscriptionTier;
  subscriptionExpiresAt?: Date;
  telegramChatId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({ timestamps: true })
export class User extends Document implements IUser {
  @Prop({ required: true, unique: true, type: String })
  username: string;

  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ type: String })
  displayName?: string;

  @Prop({ type: String })
  picture?: string;

  @Prop({ enum: SubscriptionTier, default: SubscriptionTier.FREE })
  subscription: SubscriptionTier;

  @Prop({ type: Date })
  subscriptionExpiresAt?: Date;

  @Prop({ type: String })
  telegramChatId?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
