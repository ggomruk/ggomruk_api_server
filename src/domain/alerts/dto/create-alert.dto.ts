import { IsString, IsNumber, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AlertType {
  PRICE_ABOVE = 'price_above',
  PRICE_BELOW = 'price_below',
  PRICE_CHANGE_PERCENT = 'price_change_percent',
  INDICATOR_SIGNAL = 'indicator_signal',
}

export enum AlertStatus {
  ACTIVE = 'active',
  TRIGGERED = 'triggered',
  CANCELLED = 'cancelled',
}

export class CreateAlertDTO {
  @ApiProperty({ description: 'Trading symbol', example: 'BTCUSDT' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Alert type', enum: AlertType, example: AlertType.PRICE_ABOVE })
  @IsEnum(AlertType)
  alertType: AlertType;

  @ApiProperty({ description: 'Target value (price or percentage)', example: 50000 })
  @IsNumber()
  targetValue: number;

  @ApiProperty({ 
    description: 'Indicator parameters for indicator_signal type',
    example: { indicator: 'RSI', period: 14, threshold: 30 },
    required: false
  })
  @IsOptional()
  @IsObject()
  indicatorParams?: Record<string, any>;

  @ApiProperty({ description: 'Alert message/description', example: 'BTC reached $50,000', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
