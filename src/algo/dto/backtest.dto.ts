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
import { IBacktestParams } from 'src/database/schema/backtestParams.schema';

export class BacktestDTO {
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @IsNotEmpty()
  @IsNumber()
  usdt: number;

  @IsNotEmpty()
  @IsString()
  interval: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

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
