import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OptimizerService } from './optimizer.service';
import { OptimizeStrategyDTO } from './dto/optimize-strategy.dto';
import { CompareStrategiesDTO } from './dto/compare-strategies.dto';
import { WalkForwardDTO } from './dto/walk-forward.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Optimizer')
@Controller('optimizer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OptimizerController {
  constructor(private readonly optimizerService: OptimizerService) {}

  @Post('optimize')
  @ApiOperation({ 
    summary: 'Optimize strategy parameters',
    description: 'Run grid search to find optimal strategy parameters. Returns optimization ID to track progress.'
  })
  @ApiResponse({ status: 201, description: 'Optimization started' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async optimizeStrategy(
    @Body() dto: OptimizeStrategyDTO,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.optimizerService.optimizeStrategy(dto, userId);
  }

  @Get('optimize/:id')
  @ApiOperation({ 
    summary: 'Get optimization status and results',
    description: 'Check the progress of an optimization job and retrieve results when complete.'
  })
  @ApiResponse({ status: 200, description: 'Optimization status retrieved' })
  @ApiResponse({ status: 404, description: 'Optimization not found' })
  async getOptimizationStatus(@Param('id') id: string) {
    const result = await this.optimizerService.getOptimizationStatus(id);
    if (!result) {
      return { error: 'Optimization not found' };
    }
    return result;
  }

  @Post('compare')
  @ApiOperation({ 
    summary: 'Compare multiple strategies',
    description: 'Compare performance metrics across multiple backtest results side-by-side.'
  })
  @ApiResponse({ status: 200, description: 'Comparison completed' })
  @ApiResponse({ status: 400, description: 'Invalid backtest IDs' })
  async compareStrategies(@Body() dto: CompareStrategiesDTO) {
    return this.optimizerService.compareStrategies(dto);
  }

  @Post('walk-forward')
  @ApiOperation({ 
    summary: 'Run walk-forward analysis',
    description: 'Validate strategy robustness using walk-forward testing. Trains on historical data and tests on future data in rolling windows.'
  })
  @ApiResponse({ status: 201, description: 'Walk-forward analysis started' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async walkForwardAnalysis(
    @Body() dto: WalkForwardDTO,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.optimizerService.walkForwardAnalysis(dto, userId);
  }

  @Get('walk-forward/:id')
  @ApiOperation({ 
    summary: 'Get walk-forward analysis results',
    description: 'Retrieve the results of a walk-forward analysis.'
  })
  @ApiResponse({ status: 200, description: 'Results retrieved' })
  @ApiResponse({ status: 404, description: 'Analysis not found' })
  async getWalkForwardResults(@Param('id') id: string) {
    return this.optimizerService.getWalkForwardResults(id);
  }
}
