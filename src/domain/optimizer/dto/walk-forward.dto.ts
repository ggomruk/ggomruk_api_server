import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WalkForwardDTO {
  @ApiProperty({ description: 'Trading symbol', example: 'BTCUSDT' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Timeframe interval', example: '1h' })
  @IsString()
  interval: string;

  @ApiProperty({ description: 'Start date', example: '2024-01-01' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: 'End date', example: '2024-12-31' })
  @IsString()
  endDate: string;

  @ApiProperty({ description: 'Strategy name', example: 'RSI' })
  @IsString()
  strategy: string;

  @ApiProperty({ description: 'Training window size in days', example: 60 })
  @IsNumber()
  @Min(30)
  @Max(365)
  trainingWindow: number;

  @ApiProperty({ description: 'Testing window size in days', example: 30 })
  @IsNumber()
  @Min(7)
  @Max(180)
  testingWindow: number;

  @ApiProperty({ description: 'Step size in days (how much to roll forward)', example: 30 })
  @IsNumber()
  @Min(1)
  @Max(90)
  stepSize: number;

  @ApiProperty({ description: 'Strategy parameters as JSON', example: { rsiPeriod: 14, rsiBuy: 30, rsiSell: 70 }, required: false })
  @IsOptional()
  strategyParams?: Record<string, any>;

  @ApiProperty({ description: 'Leverage', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(125)
  leverage?: number;

  @ApiProperty({ description: 'Commission rate', example: 0.001, required: false })
  @IsOptional()
  @IsNumber()
  commission?: number;

  @ApiProperty({ description: 'Initial USDT', example: 10000, required: false })
  @IsOptional()
  @IsNumber()
  usdt?: number;
}
