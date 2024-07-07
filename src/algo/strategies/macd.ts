import { IsNumberWithStep } from '../customValidator/isNumberWithStep';

export class MACD {
  @IsNumberWithStep(5, 20, 1)
  fast: number;
  @IsNumberWithStep(21, 50, 1)
  slow: number;
  @IsNumberWithStep(5, 20, 1)
  signal: number;
}
