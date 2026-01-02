import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimalWithStep } from '../customValidator/IsDecimalWithStep';
import { BB, MACD, RSI, RV, SMA, SO } from '../customValidator/validatorTypes';
import { ValidStrategyParams } from '../customValidator/IsValidStrategyParams';
import { E_StrategyNames } from '../enum/strategy';
import { IBacktestParams } from '../../backtest/schemas/backtestParams.schema';

export class BacktestDTO {
  @ApiProperty({ 
    description: 'Trading symbol (e.g., BTCUSDT)', 
    example: 'BTCUSDT' 
  })
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @ApiProperty({ 
    description: 'Initial capital in USDT', 
    example: 10000,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  usdt: number;

  @ApiProperty({ 
    description: 'Trading interval (e.g., "1m", "5m", "1h")', 
    example: '1h' 
  })
  @IsNotEmpty()
  @IsString()
  interval: string;

  @ApiProperty({ 
    description: 'Backtest start date in ISO 8601 format', 
    example: '2024-01-01T00:00:00.000Z' 
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ 
    description: 'Backtest end date in ISO 8601 format', 
    example: '2024-12-31T23:59:59.999Z' 
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ 
    description: 'Trading commission/fee as decimal (0.1 = 0.1%)', 
    example: 0.1,
    minimum: 0.00001,
    maximum: 2.0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.00001)
  @Max(2.0)
  @IsDecimalWithStep()
  tc: number;

  @ApiProperty({ 
    description: 'Leverage multiplier', 
    example: 10,
    minimum: 1,
    maximum: 70
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(70)
  leverage: number;

  @ApiProperty({ 
    description: 'Trading strategies with their parameters',
    example: {
      MACD: { fast: 12, slow: 26, signal: 9 },
      RSI: { period: 14, overbought: 70, oversold: 30 }
    }
  })
  @IsNotEmpty()
  @ValidStrategyParams({
    message: 'Invalid strategy parameters for the given strategy name',
  })
  strategies: Record<E_StrategyNames, BB | MACD | RSI | RV | SMA | SO>;
  
  toBacktestParams() : IBacktestParams{
    let strategies = {}
    for (const strategy in this.strategies) {
      let params = this.strategies[strategy]
      strategies[strategy.toLowerCase()] = params
    }
    return {
      symbol: this.symbol,
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate),
      commission: this.tc,
      usdt: this.usdt,
      leverage: this.leverage,
      interval: this.interval,
      strategies: strategies,
    };
  }
}
