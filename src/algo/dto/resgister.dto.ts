import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { IsDecimalWithStep } from '../customValidator/IsDecimalWithStep';
import { BB, MACD, RSI, RV, SMA, SO } from '../customValidator/validatorTypes';

export class BacktestDTO {
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(360)
  startDate: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(360)
  endDate: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.00001)
  @Max(2.0)
  @IsDecimalWithStep()
  commission: number;

  @IsNotEmpty()
  @IsNumber()
  usdt: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(70)
  leverage: number;

  @IsNotEmpty()
  @IsString()
  interval: string;

  @IsNotEmpty()
  startegies: Strategy[];
}

export class Strategy {
  startegyName: string;
  params: Record<string, BB | MACD | RSI | RV | SMA | SO>;
}
