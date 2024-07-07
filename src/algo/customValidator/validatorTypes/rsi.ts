import { IsNumberWithStep } from '../isNumberWithStep';

export class RSI {
  @IsNumberWithStep(5, 20, 1)
  window: number;
  @IsNumberWithStep(65, 80, 1)
  overbought: number;
  @IsNumberWithStep(20, 35, 1)
  oversold: number;
}
