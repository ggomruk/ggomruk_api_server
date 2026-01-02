import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsNumberWithStep } from '../isNumberWithStep';

export class RV {
  @IsNumberWithStep(2, 20, 2)
  return_thresh_low: number;
  @IsNumberWithStep(80, 98, 2)
  return_thresh_high: number;
  @IsNumberWithStep(0, 18, 2)
  volume_thresh_low: number;
  @IsNumberWithStep(18, 40, 2)
  volume_thresh_high: number;
}

@ValidatorConstraint({ async: true })
export class RVParamsValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    return (
      value.return_thresh_low !== undefined &&
      value.return_thresh_high !== undefined &&
      value.volume_thresh_low !== undefined &&
      value.volume_thresh_high !== undefined
    );
  }

  defaultMessage() {
    return "Invalid parameters for strategy 'RV'";
  }
}
