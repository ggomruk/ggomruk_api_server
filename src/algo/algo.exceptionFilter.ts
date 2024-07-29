import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AlgoException, AlgoExceptionCode } from './algo.exception';

interface AlgoExceptionResponse {
  code: AlgoExceptionCode;
  message: string;
}

@Catch(AlgoException)
export class AlgoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AlgoExceptionFilter.name);

  catch(exception: AlgoException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus(); // HTTP Status Code

    const { code, message } = exception.getResponse() as AlgoExceptionResponse;

    this.logger.error(JSON.stringify({ code, message, status }));

    response.status(status).json({
      errorCode: code,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
