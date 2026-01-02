import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsNumberWithStep } from '../isNumberWithStep';

export class RSI {
  @IsNumberWithStep(5, 20, 1)
  periods: number;
  @IsNumberWithStep(65, 80, 1)
  rsi_upper: number;
  @IsNumberWithStep(20, 35, 1)
  rsi_lower: number;
}

@ValidatorConstraint({ async: true })
export class RSIParamsValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return (
      value.periods !== undefined &&
      value.rsi_upper !== undefined &&
      value.rsi_lower !== undefined
    );
  }

  defaultMessage() {
    return "Invalid parameters for strategy 'RSI'";
  }
}
