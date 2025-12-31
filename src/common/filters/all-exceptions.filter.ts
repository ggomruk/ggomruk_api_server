import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { GeneralResponse } from '../dto/general-response.dto';
import { ErrorCode } from '../enums/error-code.enum';

/**
 * All Exceptions Filter
 * Catches all unhandled exceptions and returns them in GeneralResponse format
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';

    // Handle HTTP exceptions (thrown by NestJS controllers)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        message = Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message[0]
          : exceptionResponse.message;
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }

      // Map HTTP status to error codes
      errorCode = this.mapHttpStatusToErrorCode(status, message);
    }
    // Handle standard errors
    else if (exception instanceof Error) {
      message = exception.message;
      errorCode = this.mapErrorMessageToErrorCode(message);
    }

    // Log the error (but don't expose internal details to client)
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Send standardized error response
    const errorResponse = GeneralResponse.error(
      errorCode,
      this.getUserFriendlyMessage(errorCode, message),
    );

    response.status(status).json(errorResponse);
  }

  /**
   * Map HTTP status codes to application error codes
   */
  private mapHttpStatusToErrorCode(status: number, message: string): ErrorCode {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        if (message.toLowerCase().includes('token')) {
          return ErrorCode.AUTH_TOKEN_INVALID;
        }
        return ErrorCode.AUTH_UNAUTHORIZED;

      case HttpStatus.FORBIDDEN:
        return ErrorCode.AUTH_UNAUTHORIZED;

      case HttpStatus.NOT_FOUND:
        if (message.toLowerCase().includes('user')) {
          return ErrorCode.AUTH_USER_NOT_FOUND;
        }
        return ErrorCode.RESOURCE_NOT_FOUND;

      case HttpStatus.CONFLICT:
        if (message.toLowerCase().includes('exists')) {
          return ErrorCode.AUTH_USER_ALREADY_EXISTS;
        }
        return ErrorCode.RESOURCE_CONFLICT;

      case HttpStatus.BAD_REQUEST:
        if (message.toLowerCase().includes('password')) {
          return ErrorCode.AUTH_WEAK_PASSWORD;
        }
        if (message.toLowerCase().includes('email')) {
          return ErrorCode.AUTH_INVALID_EMAIL;
        }
        if (message.toLowerCase().includes('credential')) {
          return ErrorCode.AUTH_INVALID_CREDENTIALS;
        }
        return ErrorCode.VALIDATION_FAILED;

      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Map error messages to application error codes
   */
  private mapErrorMessageToErrorCode(message: string): ErrorCode {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('credential') || lowerMessage.includes('password')) {
      return ErrorCode.AUTH_INVALID_CREDENTIALS;
    }
    if (lowerMessage.includes('token')) {
      return ErrorCode.AUTH_TOKEN_INVALID;
    }
    if (lowerMessage.includes('user') && lowerMessage.includes('not found')) {
      return ErrorCode.AUTH_USER_NOT_FOUND;
    }
    if (lowerMessage.includes('already exists')) {
      return ErrorCode.AUTH_USER_ALREADY_EXISTS;
    }
    if (lowerMessage.includes('database') || lowerMessage.includes('mongodb')) {
      return ErrorCode.DATABASE_CONNECTION_FAILED;
    }
    if (lowerMessage.includes('redis')) {
      return ErrorCode.REDIS_CONNECTION_FAILED;
    }

    return ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Get user-friendly error messages (hide internal implementation details)
   */
  private getUserFriendlyMessage(errorCode: ErrorCode, originalMessage: string): string {
    const friendlyMessages: Record<ErrorCode, string> = {
      // Authentication
      [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid username or password',
      [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please login again',
      [ErrorCode.AUTH_TOKEN_INVALID]: 'Invalid authentication token. Please login again',
      [ErrorCode.AUTH_UNAUTHORIZED]: 'You are not authorized to access this resource',
      [ErrorCode.AUTH_USER_NOT_FOUND]: 'User not found',
      [ErrorCode.AUTH_USER_ALREADY_EXISTS]: 'Username or email already exists',
      [ErrorCode.AUTH_WEAK_PASSWORD]: 'Password does not meet security requirements',
      [ErrorCode.AUTH_INVALID_EMAIL]: 'Invalid email address format',

      // Validation
      [ErrorCode.VALIDATION_FAILED]: originalMessage || 'Validation failed. Please check your input',
      [ErrorCode.VALIDATION_MISSING_FIELD]: 'Required field is missing',
      [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Invalid data format',
      [ErrorCode.VALIDATION_OUT_OF_RANGE]: 'Value is out of acceptable range',

      // Resources
      [ErrorCode.RESOURCE_NOT_FOUND]: 'Requested resource not found',
      [ErrorCode.RESOURCE_ALREADY_EXISTS]: 'Resource already exists',
      [ErrorCode.RESOURCE_CONFLICT]: 'Resource conflict occurred',

      // Business Logic
      [ErrorCode.BACKTEST_FAILED]: 'Backtest execution failed',
      [ErrorCode.BACKTEST_INVALID_STRATEGY]: 'Invalid strategy configuration',
      [ErrorCode.BACKTEST_INVALID_DATE_RANGE]: 'Invalid date range for backtest',
      [ErrorCode.TRADING_INSUFFICIENT_FUNDS]: 'Insufficient funds for this operation',
      [ErrorCode.TRADING_MARKET_CLOSED]: 'Market is currently closed',

      // Database
      [ErrorCode.DATABASE_CONNECTION_FAILED]: 'Unable to connect to database. Please try again later',
      [ErrorCode.DATABASE_QUERY_FAILED]: 'Database operation failed. Please try again',
      [ErrorCode.DATABASE_TRANSACTION_FAILED]: 'Transaction failed. Please try again',

      // External Services
      [ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE]: 'External service is temporarily unavailable',
      [ErrorCode.EXTERNAL_SERVICE_TIMEOUT]: 'Service request timed out. Please try again',
      [ErrorCode.REDIS_CONNECTION_FAILED]: 'Cache service unavailable. Please try again later',

      // Internal
      [ErrorCode.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred. Please try again later',
      [ErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred. Please contact support',
    };

    return friendlyMessages[errorCode] || 'An unexpected error occurred';
  }
}
