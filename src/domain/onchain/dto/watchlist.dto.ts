import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsEthereumAddress,
} from 'class-validator';
import { BlockchainType } from '../schemas';

export class AddWatchlistDto {
  @ApiProperty({
    description: 'Wallet address to track',
    example: '0x28C6c06298d514Db089934071355E5743bf21d60',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Blockchain network',
    enum: BlockchainType,
    example: BlockchainType.ETHEREUM,
  })
  @IsEnum(BlockchainType)
  blockchain: BlockchainType;

  @ApiPropertyOptional({
    description: 'Custom nickname for this address',
    example: 'Binance Hot Wallet',
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({
    description: 'Minimum USD value to trigger alert',
    example: 1000000,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  alertThresholdUsd?: number;

  @ApiPropertyOptional({
    description: 'Enable Telegram alerts',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  telegramAlert?: boolean;

  @ApiPropertyOptional({
    description: 'Enable in-app alerts',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  inAppAlert?: boolean;

  @ApiPropertyOptional({
    description: 'Personal notes about this address',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWatchlistDto {
  @ApiPropertyOptional({ description: 'Custom nickname' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: 'Alert threshold in USD' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  alertThresholdUsd?: number;

  @ApiPropertyOptional({ description: 'Enable alerts' })
  @IsOptional()
  @IsBoolean()
  alertEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable Telegram alerts' })
  @IsOptional()
  @IsBoolean()
  telegramAlert?: boolean;

  @ApiPropertyOptional({ description: 'Enable in-app alerts' })
  @IsOptional()
  @IsBoolean()
  inAppAlert?: boolean;

  @ApiPropertyOptional({ description: 'Personal notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
