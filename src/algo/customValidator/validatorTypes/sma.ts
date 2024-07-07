import { IsNumberWithStep } from '../isNumberWithStep';

export class SMA {
  @IsNumberWithStep(1, 30, 2)
  short: number;
  @IsNumberWithStep(30, 60, 2)
  medium: number;
  @IsNumberWithStep(70, 200, 2)
  long: number;
}
