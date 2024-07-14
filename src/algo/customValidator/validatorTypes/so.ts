import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { IsNumberWithStep } from '../isNumberWithStep';

export class SO {
  @IsNumberWithStep(10, 100, 1)
  kWindow: number;
  @IsNumberWithStep(3, 50, 1)
  dWindow: number;
}

@ValidatorConstraint({ async: true })
export class SOParamsValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    return value.kWindow !== undefined && value.dWindow !== undefined;
  }

  defaultMessage() {
    return "Invalid parameters for strategy 'SO'";
  }
}
