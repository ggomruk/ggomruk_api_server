import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type UserAuthDocument = UserAuth & Document;

@Schema({ timestamps: true, collection: 'user_auths' })
export class UserAuth extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true, type: String })
  provider: string; // 'local', 'google', 'github', etc.

  @Prop({ type: String }) // Nullable for 'local'
  providerUserId?: string;

  @Prop({ type: String }) // Nullable for OAuth
  password?: string;
}

export const UserAuthSchema = SchemaFactory.createForClass(UserAuth);

// Index for fast lookups
// Ensure unique provider_user_id for Oauth providers
UserAuthSchema.index(
  { provider: 1, providerUserId: 1 },
  {
    unique: true,
    partialFilterExpression: { providerUserId: { $exists: true, $ne: null } },
  },
);
UserAuthSchema.index({ user: 1 });
