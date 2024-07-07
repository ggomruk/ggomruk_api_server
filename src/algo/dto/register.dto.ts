import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { IsDecimalWithStep } from '../customValidator/IsDecimalWithStep';
import { BB, MACD, RSI, RV, SMA, SO } from '../strategies';

export class RegisterAlgoDto {
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(360)
  startDate: number;

  @IsNotEmpty()
  @IsDecimal()
  @Min(0.00001)
  @Max(2)
  @IsDecimalWithStep()
  commision: number;

  @IsNotEmpty()
  @IsString()
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
  startegeis: Strategy[];
}

export class Strategy {
  startegyName: string;
  params: Record<string, BB | MACD | RSI | RV | SMA | SO>;
}
