import { IsNumberWithStep } from '../customValidator/isNumberWithStep';

export class RV {
  @IsNumberWithStep(2, 20, 2)
  reuturnLow: number;
  @IsNumberWithStep(80, 98, 2)
  returnHigh: number;
  @IsNumberWithStep(0, 18, 2)
  volumeLow: number;
  @IsNumberWithStep(18, 40, 2)
  volumeHigh: number;
}
