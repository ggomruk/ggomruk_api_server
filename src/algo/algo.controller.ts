import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  UseFilters,
} from '@nestjs/common';
import { AlgoException, AlgoExceptionCode } from './algo.exception';
import { AlgoExceptionFilter } from './algo.exceptionFilter';

@Controller('/api/algo')
@UseFilters(AlgoExceptionFilter)
export class AlgoController {
  private readonly logger = new Logger(AlgoController.name);

  @Get('list')
  getAlgorithms() {
    throw new AlgoException(
      AlgoExceptionCode.ALGO_DOES_NOT_EXISTS,
      'Algorithm does not exists',
      HttpStatus.OK,
    );
  }

  @Post('register')
  registerAlgorithm() {}

  @Get('result')
  getTestResult() {}

  @Post('backtest')
  backtest() {}
}
