import { IsNumberWithStep } from '../customValidator/isNumberWithStep';

export class BB {
  @IsNumberWithStep(25, 100, 1)
  window: number;
  @IsNumberWithStep(1, 5, 1)
  numStdDev: number;
}
