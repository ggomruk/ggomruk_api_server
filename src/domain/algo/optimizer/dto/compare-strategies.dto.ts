import { IsArray, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CompareStrategiesDTO {
  @ApiProperty({
    description: 'Array of backtest IDs to compare',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsArray()
  @IsString({ each: true })
  backtestIds: string[];

  @ApiProperty({
    description: 'Metrics to compare',
    example: ['total_return', 'sharpe_ratio', 'max_drawdown', 'win_rate'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];
}
