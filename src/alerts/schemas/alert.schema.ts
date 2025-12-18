import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AlertType, AlertStatus } from '../dto/create-alert.dto';

@Schema({ timestamps: true })
export class Alert {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, enum: AlertType })
  alertType: AlertType;

  @Prop({ required: true })
  targetValue: number;

  @Prop({ type: Object })
  indicatorParams?: Record<string, any>;

  @Prop()
  message?: string;

  @Prop({ required: true, enum: AlertStatus, default: AlertStatus.ACTIVE })
  status: AlertStatus;

  @Prop()
  triggeredAt?: Date;

  @Prop()
  triggeredPrice?: number;
}

export type AlertDocument = Alert & Document;
export const AlertSchema = SchemaFactory.createForClass(Alert);
