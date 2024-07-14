import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsNumberWithStep } from '../isNumberWithStep';

export class RSI {
  @IsNumberWithStep(5, 20, 1)
  window: number;
  @IsNumberWithStep(65, 80, 1)
  overbought: number;
  @IsNumberWithStep(20, 35, 1)
  oversold: number;
}

@ValidatorConstraint({ async: true })
export class RSIParamsValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    return (
      value.window !== undefined &&
      value.overbought !== undefined &&
      value.oversold !== undefined
    );
  }

  defaultMessage() {
    return "Invalid parameters for strategy 'RSI'";
  }
}
