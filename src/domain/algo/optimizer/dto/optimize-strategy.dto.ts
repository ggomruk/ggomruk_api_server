import {
  IsString,
  IsArray,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ParameterRange {
  @ApiProperty({
    description: 'Parameter name (e.g., ema_s, ema_l)',
    example: 'ema_s',
  })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Minimum value', example: 5 })
  @IsNumber()
  min: number;

  @ApiProperty({ description: 'Maximum value', example: 30 })
  @IsNumber()
  max: number;

  @ApiProperty({ description: 'Step size', example: 1 })
  @IsNumber()
  @Min(0.001)
  step: number;
}

class StrategyConfig {
  @ApiProperty({
    description: 'Unique identifier for this strategy config',
    example: 'abc123',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Strategy type (e.g., macd, bollinger, rsi)',
    example: 'macd',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Parameter ranges for this strategy',
    type: [ParameterRange],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterRange)
  parameters: ParameterRange[];
}

export class OptimizeStrategyDTO {
  @ApiProperty({ description: 'Trading symbol', example: 'BTC/USDT' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Timeframe interval', example: '1d' })
  @IsString()
  interval: string;

  @ApiProperty({ description: 'Start date', example: '2024-01-01' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: 'End date', example: '2024-12-31' })
  @IsString()
  endDate: string;

  @ApiProperty({
    description: 'Strategies with their parameter ranges',
    type: [StrategyConfig],
    example: [
      {
        id: 'init',
        type: 'macd',
        parameters: [
          { name: 'ema_s', min: 1, max: 50, step: 1 },
          { name: 'ema_l', min: 10, max: 100, step: 5 },
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrategyConfig)
  strategies: StrategyConfig[];

  @ApiProperty({
    description: 'Optimization metric',
    example: 'sharpe',
    enum: ['sharpe', 'return', 'profit_factor', 'win_rate'],
  })
  @IsOptional()
  @IsString()
  metric?: 'sharpe' | 'return' | 'profit_factor' | 'win_rate';

  @ApiProperty({ description: 'Leverage', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(125)
  leverage?: number;

  @ApiProperty({
    description: 'Commission rate',
    example: 0.001,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.1)
  commission?: number;

  @ApiProperty({ description: 'Initial USDT', example: 10000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(100)
  usdt?: number;
}
