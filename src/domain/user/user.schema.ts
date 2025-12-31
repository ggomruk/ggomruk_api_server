import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
  password: string;
  googleId?: string;
  displayName?: string;
  picture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({ timestamps: true })
export class User extends Document implements IUser {
  @Prop({ required: true, unique: true, type: String })
  username: string;

  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ type: String })
  googleId?: string;

  @Prop({ type: String })
  displayName?: string;

  @Prop({ type: String })
  picture?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
