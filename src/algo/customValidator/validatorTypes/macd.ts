import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsNumberWithStep } from '../isNumberWithStep';

export class MACD {
  @IsNumberWithStep(5, 20, 1)
  fast: number;
  @IsNumberWithStep(21, 50, 1)
  slow: number;
  @IsNumberWithStep(5, 20, 1)
  signal: number;
}

@ValidatorConstraint({ async: true })
export class MACDParamsValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    return (
      value.fast !== undefined &&
      value.slow !== undefined &&
      value.signal !== undefined
    );
  }

  defaultMessage() {
    return "Invalid parameters for strategy 'MACD'";
  }
}
