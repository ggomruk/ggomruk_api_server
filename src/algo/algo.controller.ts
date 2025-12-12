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
import { AlgoService } from './algo.service';
import { SignalDTO } from './dto/signal.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('algo')
@UseFilters(AlgoExceptionFilter)
@UseGuards(JwtAuthGuard) // Protect all algo routes with JWT authentication
export class AlgoController {
  private readonly logger = new Logger(AlgoController.name);

  constructor(private readonly algoService: AlgoService) {}

  // /api/v1/algo/backtest
  @Post('backtest')
  async registerAlgorithm(
    @Body() backtestDTO: BacktestDTO,
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

  // /api/v1/algo/signal
  @Post('signal')
  async registerSignal(
    @Body() signalDTO: SignalDTO,
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

  // /api/v1/algo/result
  @Get('result')
  getTestResult(@Request() req) {
    const userId = req.user.userId;
    // TODO: Implement fetching backtest results for the user
    return { ok: 1, message: 'Get results endpoint - to be implemented' };
  }

  // /api/v1/algo/backtests
  @Get('backtests')
  async getUserBacktests(@Request() req) {
    try {
      const userId = req.user.userId;
      this.logger.log(`User ${userId} fetching backtest history`);
      
      const backtests = await this.algoService.getUserBacktests(userId);
      
      return { 
        ok: 1, 
        data: backtests 
      };
    } catch (err) {
      this.logger.error(`Failed to fetch backtests: ${err.message}`);
      return { ok: 0, error: err.message };
    }
  }

  // /api/v1/algo/backtest/:id
  @Get('backtest/:id')
  async getBacktestById(@Request() req) {
    try {
      const userId = req.user.userId;
      const backtestId = req.params.id;
      
      this.logger.log(`User ${userId} fetching backtest ${backtestId}`);
      
      const backtest = await this.algoService.getBacktestById(backtestId);
      
      if (!backtest) {
        return { ok: 0, error: 'Backtest not found' };
      }

      // Verify the backtest belongs to the user
      if (backtest.uid !== userId) {
        return { ok: 0, error: 'Unauthorized' };
      }
      
      return { 
        ok: 1, 
        data: backtest 
      };
    } catch (err) {
      this.logger.error(`Failed to fetch backtest: ${err.message}`);
      return { ok: 0, error: err.message };
    }
  }

}
