import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsNumberWithStep } from '../isNumberWithStep';

export class SMA {
  @IsNumberWithStep(1, 30, 2)
  sma_s: number;
  @IsNumberWithStep(30, 60, 2)
  sma_m: number;
  @IsNumberWithStep(70, 200, 2)
  sma_l: number;
}

@ValidatorConstraint({ async: true })
export class SMAParamsValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    return (
      value.sma_s !== undefined &&
      value.sma_m !== undefined &&
      value.sma_l !== undefined
    );
  }

  defaultMessage() {
    return "Invalid parameters for strategy 'SMA'";
  }
}
