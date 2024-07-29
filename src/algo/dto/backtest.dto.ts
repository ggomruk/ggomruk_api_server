import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { IsDecimalWithStep } from '../customValidator/IsDecimalWithStep';
import { BB, MACD, RSI, RV, SMA, SO } from '../customValidator/validatorTypes';
import { ValidStrategyParams } from '../customValidator/IsValidStrategyParams';
import { E_StrategyNames } from '../enum/strategy';

export class BacktestDTO {
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @IsNotEmpty()
  @IsNumber()
  usdt: string;

  @IsNotEmpty()
  @IsString()
  interval: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: number;

  @IsNotEmpty()
  @IsDateString()
  endDate: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.00001)
  @Max(2.0)
  @IsDecimalWithStep()
  tc: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(70)
  leverage: number;

  @IsNotEmpty()
  @ValidStrategyParams({
    message: 'Invalid strategy parameters for the given strategy name',
  })
  strategies: Record<E_StrategyNames, BB | MACD | RSI | RV | SMA | SO>;
}
