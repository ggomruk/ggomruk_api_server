import { ErrorCode } from '../enums/error-code.enum';

/**
 * Standardized API response structure
 * Used across all endpoints for consistency
 */
export class GeneralResponse<T = any> {
  /**
   * Indicates if the API request was successful
   */
  isOk: boolean;

  /**
   * Custom error code (only present when isOk = false)
   * Provides more specific error information than HTTP status codes
   */
  errorCode?: ErrorCode;

  /**
   * Human-readable message
   * - Success message when isOk = true
   * - Error message when isOk = false
   */
  message: string;

  /**
   * Response payload
   * Contains the actual data returned by the API
   */
  payload?: T;

  /**
   * Create a success response
   */
  static success<T>(payload: T, message = 'Success'): GeneralResponse<T> {
    return {
      isOk: true,
      message,
      payload,
    };
  }

  /**
   * Create an error response
   */
  static error<T = any>(
    errorCode: ErrorCode,
    message: string,
    payload?: T,
  ): GeneralResponse<T> {
    return {
      isOk: false,
      errorCode,
      message,
      payload,
    };
  }
}
