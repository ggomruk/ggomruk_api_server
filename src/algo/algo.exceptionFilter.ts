import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { AlgoException, AlgoExceptionCode } from './algo.exception';

interface AlgoExceptionResponse {
  code: AlgoExceptionCode;
  message: string;
}

@Catch(AlgoException)
export class AlgoExceptionFilter implements ExceptionFilter {
  catch(exception: AlgoException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const { code, message } = exception.getResponse() as AlgoExceptionResponse;

    response.status(status).json({
      errorCode: code,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
