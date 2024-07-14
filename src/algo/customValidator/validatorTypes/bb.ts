import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsNumberWithStep } from '../isNumberWithStep';

export class BB {
  @IsNumberWithStep(25, 100, 1)
  window: number;
  @IsNumberWithStep(1, 5, 1)
  numStdDev: number;
}

@ValidatorConstraint({ async: true })
export class BBParamsValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    return value.window !== undefined && value.numStdDev !== undefined;
  }

  defaultMessage() {
    return "Invalid parameters for strategy 'BB'";
  }
}
