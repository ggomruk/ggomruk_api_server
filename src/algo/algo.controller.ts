import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UseFilters,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AlgoException, AlgoExceptionCode } from './algo.exception';
import { AlgoExceptionFilter } from './algo.exceptionFilter';
import { BacktestDTO } from './dto/backtest.dto';
import { AlgoValidationPipe } from './algo.pipe';
import { AlgoService } from './algo.service';
import { SignalDTO } from './dto/signal.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('/api/algo')
@UseFilters(AlgoExceptionFilter)
@UseGuards(JwtAuthGuard) // Protect all algo routes with JWT authentication
export class AlgoController {
  private readonly logger = new Logger(AlgoController.name);

  constructor(private readonly algoService: AlgoService) {}

  @Post('backtest')
  async registerAlgorithm(
    @Body(new AlgoValidationPipe()) backtestDTO: BacktestDTO,
    @Request() req,
  ) {
    try {
      const userId = req.user.userId; // Get userId from JWT token
      this.logger.log(`User ${userId} requesting backtest: ${JSON.stringify(backtestDTO)}`);
      
      const backtestId = await this.algoService.runBacktest(backtestDTO, userId);
      
      return { 
        ok: 1, 
        data: { 
          backtestId,
          status: 'pending',
          message: 'Backtest has been queued for processing'
        } 
      };
    } catch(err) {
      let errorResponse = err.response;
      if (err instanceof AlgoException) {
        return { ok: 0, error: err.message, code: errorResponse.code };
      }
      return { ok: 0, error: err.message };
    }
  }

  @Post('signal')
  async registerSignal(
    @Body(new AlgoValidationPipe()) signalDTO: SignalDTO,
    @Request() req,
  ) {
    try {
      const userId = req.user.userId;
      this.logger.log(`User ${userId} registering signal: ${JSON.stringify(signalDTO)}`);
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
  getTestResult(@Request() req) {
    const userId = req.user.userId;
    // TODO: Implement fetching backtest results for the user
    return { ok: 1, message: 'Get results endpoint - to be implemented' };
  }

}
