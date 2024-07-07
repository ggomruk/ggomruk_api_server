import { IsNumberWithStep } from '../isNumberWithStep';

export class SO {
  @IsNumberWithStep(10, 100, 1)
  kWindow: number;
  @IsNumberWithStep(3, 50, 1)
  dWindow: number;
}
