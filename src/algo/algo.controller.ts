import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UseFilters,
} from '@nestjs/common';
import { AlgoException, AlgoExceptionCode } from './algo.exception';
import { AlgoExceptionFilter } from './algo.exceptionFilter';
import { BacktestDTO } from './dto/backtest.dto';
import { AlgoValidationPipe } from './algo.pipe';
import { AlgoService } from './algo.service';
import { SignalDTO } from './dto/signal.dto';

@Controller('/api/algo')
@UseFilters(AlgoExceptionFilter)
export class AlgoController {
  private readonly logger = new Logger(AlgoController.name);

  constructor(private readonly algoService: AlgoService) {}

  @Post('backtest')
  async registerAlgorithm(
    @Body(new AlgoValidationPipe()) backtestDTO: BacktestDTO,
  ) {
    try {
      const result = await this.algoService.runBacktest(backtestDTO);
      return { ok: 1, data: result };
    } catch(err) {
      let errorResponse = err.response;
      if (err instanceof AlgoException) {
        return { ok: 0, error: err.message, code: errorResponse.code };
      }
      return { ok: 0, error: err.message };
    }
  }

  @Post('signal')
    async registerSignal(@Body(new AlgoValidationPipe()) signalDTO: SignalDTO) {
      try {
        this.logger.log(`Received Data: ${JSON.stringify(signalDTO)}`);
        const result = await this.algoService.registerSignal(signalDTO);
        return { ok: 1, data: result }
      } catch (err) {
        let errorResponse = err.response;
        if (err instanceof AlgoException) {
          return { ok: 0, err: err.message, code: errorResponse.code }
        }
        return { ok: 0, err: err.message}
      }
      
  }

  @Get('result')
  getTestResult() {}

}
