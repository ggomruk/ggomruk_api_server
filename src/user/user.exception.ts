import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

export enum UserExceptionCode {
  USER_NOT_FOUND = 1000,
  INVALID_CREDENTIALS = 1001,
  UNAUTHORIZED_ACCESS = 1002,
  USER_ALREADY_EXISTS = 1003,
  VALIDATION_ERROR = 1004,
  INVALID_TOKEN = 1005,
  TOKEN_EXPIRED = 1006,
  ACCOUNT_LOCKOUT = 1007,
  EMAIL_NOT_VERIFIED = 1008,
  PERMISSION_DENIED = 1009,
  ACCOUNT_DISABLED = 1010,
  SESSION_EXPIRED = 1011,
  TOO_MANY_REQUESTS = 1012,
}
@Injectable()
export class UserException extends HttpException {
  constructor(
    code: UserExceptionCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message }, status);
  }
}
