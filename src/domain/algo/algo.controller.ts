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
import { BacktestDTO } from './common/dto/backtest.dto';
import { AlgoService } from './algo.service';
import { SignalDTO } from './common/dto/signal.dto';
import { OptimizeDTO } from './common/dto/optimize.dto';
import { JwtAuthGuard } from 'src/domain/auth/guards/jwt-auth.guard';

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

  @Get('backtest/history')
  @ApiOperation({ summary: 'Get backtest history', description: 'Returns a list of past backtests for the user' })
  @ApiResponse({ status: 200, description: 'List of backtests' })
  async getBacktestHistory(@Request() req) {
    const userId = req.user.userId;
    const history = await this.algoService.getBacktestHistory(userId);
    
    const mappedHistory = history.map(h => {
        const strategies = h.backtestParams.strategies;
        // strategies is a Mongoose document, so we might need to convert to object or check keys carefully
        // But assuming it behaves like an object:
        const strategyNames = Object.keys(strategies).filter(k => 
            ['bb', 'macd', 'rsi', 'rv', 'sma', 'so'].includes(k) && (strategies as any)[k] != null
        );
        const strategyName = strategyNames.length > 0 ? strategyNames.join('+').toUpperCase() : 'Unknown';
        
        return {
            id: h.uid,
            name: `${strategyName} Strategy`,
            strategy: strategyName,
            symbol: h.backtestParams.symbol,
            date: (h as any).createdAt,
            result: h.result
        };
    });

    return { ok: 1, data: mappedHistory };
  }

  // /api/v1/algo/optimize
  @Post('optimize')
  @ApiOperation({ summary: 'Submit an optimization request', description: 'Queues an optimization task (grid search) for processing' })
  @ApiBody({ type: OptimizeDTO })
  @ApiResponse({ status: 200, description: 'Optimization queued successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async registerOptimization(
    @Body() optimizeDTO: OptimizeDTO,
    @Request() req,
  ) {
    try {
      const userId = req.user.userId;
      this.logger.log(`User ${userId} requesting optimization: ${JSON.stringify(optimizeDTO)}`);
      
      const optimizationId = await this.algoService.runOptimization(optimizeDTO, userId);
      
      return { 
        ok: 1, 
        data: { 
          optimizationId,
          status: 'pending',
          message: 'Optimization has been queued for processing'
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

  @Get('optimizations')
  @ApiOperation({ summary: 'Get user optimizations', description: 'Retrieve all optimization tasks for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Optimizations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOptimizations(@Request() req) {
    try {
      const userId = req.user.userId;
      this.logger.log(`User ${userId} fetching optimizations`);
      
      const optimizations = await this.algoService.getUserOptimizations(userId);
      
      return { 
        ok: 1, 
        data: optimizations 
      };
    } catch (err) {
      this.logger.error(`Failed to fetch optimizations: ${err.message}`);
      return { ok: 0, error: err.message };
    }
  }

  @Get('optimization/:id/result')
  @ApiOperation({ summary: 'Get optimization result', description: 'Retrieve the result of a completed optimization' })
  @ApiResponse({ status: 200, description: 'Optimization result retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Optimization result not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOptimizationResult(@Request() req) {
    try {
      const userId = req.user.userId;
      const optimizationId = req.params.id;
      
      this.logger.log(`User ${userId} fetching optimization result ${optimizationId}`);
      
      // First check if the task belongs to the user
      // Ideally we should check ownership, but for now let's just fetch the result
      // The result document also has userId, so we can check that
      
      const result = await this.algoService.getOptimizationResult(optimizationId);
      
      if (!result) {
        return { ok: 0, error: 'Optimization result not found' };
      }

      if (result.userId !== userId) {
        return { ok: 0, error: 'Unauthorized' };
      }
      
      return { 
        ok: 1, 
        data: result 
      };
    } catch (err) {
      this.logger.error(`Failed to fetch optimization result: ${err.message}`);
      return { ok: 0, error: err.message };
    }
  }

}
