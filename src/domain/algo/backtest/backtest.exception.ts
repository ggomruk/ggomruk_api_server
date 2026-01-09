import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

export enum BacktestExceptionCode {
  // provided parameter is invlaid (ex: range -> 30~60, got 0)
  INVALID_INTPUT_PARAMETER = 2001,
  // User provide an invalid UID to get the result
  UID_NOT_FOUND = 2002,
  // Unknown server exception
  SERVER_EXCEPTION = 2003,
  // User try to load an algorithm that does not exists
  ALGO_DOES_NOT_EXISTS = 2004,
  DUPLICATE_UID = 2005,
  BACKTEST_NOT_FOUND = 2006,
  BACKTEST_RESULT_ALREADY_EXISTS = 2007,
}

@Injectable()
export class BacktestException extends HttpException {
  constructor(
    code: BacktestExceptionCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message }, status);
  }
}
