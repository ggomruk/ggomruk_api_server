import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsNumberWithStep } from '../isNumberWithStep';

export class SMA {
  @IsNumberWithStep(1, 30, 2)
  short: number;
  @IsNumberWithStep(30, 60, 2)
  medium: number;
  @IsNumberWithStep(70, 200, 2)
  long: number;
}

@ValidatorConstraint({ async: true })
export class SMAParamsValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    return (
      value.short !== undefined &&
      value.medium !== undefined &&
      value.long !== undefined
    );
  }

  defaultMessage() {
    return "Invalid parameters for strategy 'SMA'";
  }
}
