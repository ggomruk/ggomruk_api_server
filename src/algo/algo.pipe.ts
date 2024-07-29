import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AlgoException, AlgoExceptionCode } from './algo.exception';

@Injectable()
export class AlgoValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    // metadata.metatype is the class that the value should be transformed to
    if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
      return value;
    }
    // transforms a plain object to an instance of a class
    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);
    if (errors.length) {
      throw new AlgoException(
        AlgoExceptionCode.INVALID_INTPUT_PARAMETER,
        `Invalid or missing input parameters: ${errors.map((e) => e.property).join(', ')}`,
      );
    }
    return value;
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
