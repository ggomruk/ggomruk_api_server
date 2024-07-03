import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { UserException, UserExceptionCode } from './user.exception';

interface UserExceptionResponse {
  code: UserExceptionCode;
  message: string;
}

@Catch(UserException)
export class UserExceptionFilter implements ExceptionFilter {
  catch(exception: UserException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const { code, message } = exception.getResponse() as UserExceptionResponse;

    response.status(status).json({
      errorCode: code,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
