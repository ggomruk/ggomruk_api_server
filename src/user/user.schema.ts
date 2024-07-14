import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

interface IUser {
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, type: String })
  username: string;

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass<IUser>(User);
