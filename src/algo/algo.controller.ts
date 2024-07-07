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
import { RegisterAlgoDto } from './dto/register.dto';

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

  @Get(':id')
  getAlgorithm(@Param('id') id: number) {
    console.log(id);
    return { ok: 1 };
  }

  @Post('register')
  registerAlgorithm(@Body() registerAlgoDto: RegisterAlgoDto) {
    console.log(registerAlgoDto);
    return { ok: 1 };
  }

  @Get('result')
  getTestResult() {}

  @Post('backtest')
  backtest() {}
}
