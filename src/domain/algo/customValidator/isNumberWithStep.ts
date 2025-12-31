import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsNumberWithStep(
  min: number,
  max: number,
  step: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsNumberWithStep',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [min, max, step],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [min, max, step] = args.constraints;
          if (typeof value !== 'number') {
            return false;
          }
          if (value < min || value > max) {
            return false;
          }
          return (value - min) % step === 0;
        },
        defaultMessage(args: ValidationArguments) {
          const [min, max, step] = args.constraints;
          return `${args.property} must be a number between ${min} and ${max} with a step of ${step}`;
        },
      },
    });
  };
}
