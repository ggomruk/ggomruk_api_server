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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AlgoException, AlgoExceptionCode } from './algo.exception';
import { AlgoExceptionFilter } from './algo.exceptionFilter';
import { BacktestDTO } from './dto/backtest.dto';
import { AlgoService } from './algo.service';
import { SignalDTO } from './dto/signal.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('algo')
@ApiBearerAuth('JWT-auth')
@Controller('algo')
@UseFilters(AlgoExceptionFilter)
@UseGuards(JwtAuthGuard) // Protect all algo routes with JWT authentication
export class AlgoController {
  private readonly logger = new Logger(AlgoController.name);

  constructor(private readonly algoService: AlgoService) {}

  // /api/v1/algo/backtest
  @Post('backtest')
  @ApiOperation({ summary: 'Submit a backtest request', description: 'Queues a backtest task for processing with specified parameters' })
  @ApiBody({ type: BacktestDTO })
  @ApiResponse({ status: 200, description: 'Backtest queued successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Register a trading signal', description: 'Register a new trading signal for live trading' })
  @ApiBody({ type: SignalDTO })
  @ApiResponse({ status: 200, description: 'Signal registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get test results', description: 'Fetch test results for the authenticated user (To be implemented)' })
  @ApiResponse({ status: 200, description: 'Results retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTestResult(@Request() req) {
    const userId = req.user.userId;
    // TODO: Implement fetching backtest results for the user
    return { ok: 1, message: 'Get results endpoint - to be implemented' };
  }

  // /api/v1/algo/backtests
  @Get('backtests')
  @ApiOperation({ summary: 'Get user backtest history', description: 'Retrieve all backtests for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Backtests retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get backtest by ID', description: 'Retrieve a specific backtest by its ID' })
  @ApiResponse({ status: 200, description: 'Backtest retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Backtest not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
