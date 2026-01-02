import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsNumberWithStep } from '../isNumberWithStep';

export class MACD {
  @IsNumberWithStep(5, 20, 1)
  ema_s: number;
  @IsNumberWithStep(21, 50, 1)
  ema_l: number;
  @IsNumberWithStep(5, 20, 1)
  signal_mw: number;
}

@ValidatorConstraint({ async: true })
export class MACDParamsValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return (
      value.ema_s !== undefined &&
      value.ema_l !== undefined &&
      value.signal_mw !== undefined
    );
  }

  defaultMessage() {
    return "Invalid parameters for strategy 'MACD'";
  }
}
