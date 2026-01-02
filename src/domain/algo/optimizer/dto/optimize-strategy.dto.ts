import { IsString, IsArray, IsObject, IsNumber, Min, Max, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ParameterRange {
  @ApiProperty({ description: 'Parameter name (e.g., rsiPeriod, macdFast)', example: 'rsiPeriod' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Minimum value', example: 5 })
  @IsNumber()
  @Min(1)
  min: number;

  @ApiProperty({ description: 'Maximum value', example: 30 })
  @IsNumber()
  @Max(500)
  max: number;

  @ApiProperty({ description: 'Step size', example: 5 })
  @IsNumber()
  @Min(1)
  step: number;
}

export class OptimizeStrategyDTO {
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

  @ApiProperty({ description: 'Strategy names to optimize', example: ['RSI', 'MACD'] })
  @IsArray()
  @IsString({ each: true })
  strategies: string[];

  @ApiProperty({ 
    description: 'Parameter ranges to optimize',
    type: [ParameterRange],
    example: [
      { name: 'rsiPeriod', min: 5, max: 30, step: 5 },
      { name: 'rsiBuy', min: 20, max: 40, step: 5 },
      { name: 'rsiSell', min: 60, max: 80, step: 5 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterRange)
  paramRanges: ParameterRange[];

  @ApiProperty({ description: 'Optimization metric', example: 'sharpe', enum: ['sharpe', 'return', 'profit_factor', 'win_rate'] })
  @IsString()
  metric: 'sharpe' | 'return' | 'profit_factor' | 'win_rate';

  @ApiProperty({ description: 'Leverage', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(125)
  leverage?: number;

  @ApiProperty({ description: 'Commission rate', example: 0.001, required: false })
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
