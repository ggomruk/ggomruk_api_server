import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseFilters,
} from '@nestjs/common';
import { AlgoException, AlgoExceptionCode } from './algo.exception';
import { AlgoExceptionFilter } from './algo.exceptionFilter';
import { BacktestDTO } from './dto/backtest.dto';
import { AlgoValidationPipe } from './algo.pipe';
import { AlgoService } from './algo.service';

@Controller('/api/algo')
@UseFilters(AlgoExceptionFilter)
export class AlgoController {
  private readonly logger = new Logger(AlgoController.name);

  constructor(private readonly algoService: AlgoService) {}

  @Get('list')
  getAlgorithms() {
    throw new AlgoException(
      AlgoExceptionCode.ALGO_DOES_NOT_EXISTS,
      'Algorithm does not exists',
      HttpStatus.OK,
    );
  }

  @Get(':id')
  getAlgorithm(@Param('id') id: number) {
    console.log(id);
    return { ok: 1 };
  }

  @Post('backtest')
  registerAlgorithm(@Body(new AlgoValidationPipe()) backtestDTO: BacktestDTO) {
    console.log(backtestDTO);
    this.algoService.runBacktest(backtestDTO);
    return { ok: 1 };
  }

  @Get('result')
  getTestResult() {}

  @Post('backtest')
  backtest() {}
}
