import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlockchainType, TransactionDirection } from '../schemas';

export class GetTransactionsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by blockchain',
    enum: BlockchainType,
  })
  @IsOptional()
  @IsEnum(BlockchainType)
  blockchain?: BlockchainType;

  @ApiPropertyOptional({
    description: 'Minimum USD value',
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmountUsd?: number;

  @ApiPropertyOptional({
    description: 'Maximum USD value',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmountUsd?: number;

  @ApiPropertyOptional({
    description: 'Filter by direction (to_exchange, from_exchange)',
    enum: TransactionDirection,
  })
  @IsOptional()
  @IsEnum(TransactionDirection)
  direction?: TransactionDirection;

  @ApiPropertyOptional({
    description: 'Filter by address (from or to)',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '2026-01-15T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 20,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class GetExchangeFlowQueryDto {
  @ApiPropertyOptional({
    description: 'Exchange name',
    example: 'binance',
    default: 'binance',
  })
  @IsOptional()
  @IsString()
  exchange?: string = 'binance';

  @ApiPropertyOptional({
    description: 'Filter by blockchain',
    enum: BlockchainType,
  })
  @IsOptional()
  @IsEnum(BlockchainType)
  blockchain?: BlockchainType;

  @ApiPropertyOptional({
    description: 'Symbol to filter',
    example: 'BTC',
  })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({
    description: 'Time period in hours',
    default: 24,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(720) // 30 days max
  hours?: number = 24;
}

export class GetWalletQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by blockchain',
    enum: BlockchainType,
  })
  @IsOptional()
  @IsEnum(BlockchainType)
  blockchain?: BlockchainType;
}
