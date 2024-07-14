import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsNumberWithStep } from '../isNumberWithStep';

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

@ValidatorConstraint({ async: true })
export class RVParamsValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    return (
      value.resturnLow !== undefined &&
      value.returnHigh !== undefined &&
      value.volumeLow !== undefined &&
      value.volumeHigh !== undefined
    );
  }

  defaultMessage() {
    return "Invalid parameters for strategy 'RV'";
  }
}
