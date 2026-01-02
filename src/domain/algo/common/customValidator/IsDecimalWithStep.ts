import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsDecimalWithStep(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsDecimalWithStep',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const min = 0.00001;
          const max = 2;
          if (typeof value !== 'number') {
            return false;
          }
          if (value < min || value > max) {
            return false;
          }
          const isValidStep = (value * 100000) % 1 === 0;
          return isValidStep;
        },
        defaultMessage(validationArguments) {
          return `${validationArguments.property} must be a decimal number between 0.00001 and 2 with a step of 1`;
        },
      },
    });
  };
}
