import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { IsNumberWithStep } from '../isNumberWithStep';

export class SO {
  @IsNumberWithStep(10, 100, 1)
  periods: number;
  @IsNumberWithStep(3, 50, 1)
  d_mw: number;
}

@ValidatorConstraint({ async: true })
export class SOParamsValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    return value.periods !== undefined && value.d_mw !== undefined;
  }

  defaultMessage() {
    return "Invalid parameters for strategy 'SO'";
  }
}
