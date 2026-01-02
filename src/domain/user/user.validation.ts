import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { UserException, UserExceptionCode } from './user.exception';

@Injectable()
export class UserValidationPipe implements PipeTransform<UserDTO> {
  async transform(value: any, metadata: ArgumentMetadata) {
    const targetType = metadata.metatype;

    if (!targetType || !this.toValidate(targetType)) {
      return value;
    }

    const object = plainToInstance(targetType, value);
    const errors = await validate(object);
    if (errors.length) {
      let errorMessages = this.extractErrorMessages(errors);
      // const error = errors[0];
      throw new UserException(
        UserExceptionCode.INVALID_OR_MISSING_CREDENTIALS,
        `Invalid or missing input parameters: ${errorMessages.join('. ')}`,
      );
    }
    return object;
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private extractErrorMessages(errors: ValidationError[]): string[] {
    return errors.flatMap((e: ValidationError) => Object.values(e.constraints));
  }
}
