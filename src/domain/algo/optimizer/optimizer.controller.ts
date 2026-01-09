import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OptimizerService } from './optimizer.service';
import { OptimizeStrategyDTO } from './dto/optimize-strategy.dto';
import { CompareStrategiesDTO } from './dto/compare-strategies.dto';
import { WalkForwardDTO } from './dto/walk-forward.dto';
import { JwtAuthGuard } from 'src/domain/auth/guards/jwt-auth.guard';
import { GeneralResponse } from 'src/common/dto/general-response.dto';

@ApiTags('Optimizer')
@Controller('optimizer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OptimizerController {
  constructor(private readonly optimizerService: OptimizerService) {}

  @Post('optimize')
  @ApiOperation({
    summary: 'Optimize strategy parameters',
    description:
      'Run grid search to find optimal strategy parameters. Returns optimization ID to track progress.',
  })
  @ApiResponse({ status: 201, description: 'Optimization started' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async optimizeStrategy(
    @Body() dto: OptimizeStrategyDTO,
    @Request() req: any,
  ): Promise<GeneralResponse<any>> {
    const userId = req.user.userId;
    const result = await this.optimizerService.optimizeStrategy(dto, userId);
    return GeneralResponse.success(result);
  }

  @Get('optimize/:id')
  @ApiOperation({
    summary: 'Get optimization status and results',
    description:
      'Check the progress of an optimization job and retrieve results when complete.',
  })
  @ApiResponse({ status: 200, description: 'Optimization status retrieved' })
  @ApiResponse({ status: 404, description: 'Optimization not found' })
  async getOptimizationStatus(
    @Param('id') id: string,
  ): Promise<GeneralResponse<any>> {
    const result = await this.optimizerService.getOptimizationStatus(id);
    if (!result) {
      throw new NotFoundException('Optimization not found');
    }
    return GeneralResponse.success(result);
  }

  @Get('optimizations')
  @ApiOperation({
    summary: 'Get user optimizations',
    description: 'Retrieve all optimization tasks for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Optimizations retrieved successfully',
  })
  async getOptimizations(@Request() req): Promise<GeneralResponse<any>> {
    const userId = req.user.userId;
    const result = await this.optimizerService.getUserOptimizations(userId);
    return GeneralResponse.success(result);
  }

  @Post('compare')
  @ApiOperation({
    summary: 'Compare multiple strategies',
    description:
      'Compare performance metrics across multiple backtest results side-by-side.',
  })
  @ApiResponse({ status: 200, description: 'Comparison completed' })
  @ApiResponse({ status: 400, description: 'Invalid backtest IDs' })
  async compareStrategies(
    @Body() dto: CompareStrategiesDTO,
  ): Promise<GeneralResponse<any>> {
    const result = await this.optimizerService.compareStrategies(dto);
    return GeneralResponse.success(result);
  }

  @Post('walk-forward')
  @ApiOperation({
    summary: 'Run walk-forward analysis',
    description:
      'Validate strategy robustness using walk-forward testing. Trains on historical data and tests on future data in rolling windows.',
  })
  @ApiResponse({ status: 201, description: 'Walk-forward analysis started' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async walkForwardAnalysis(
    @Body() dto: WalkForwardDTO,
    @Request() req: any,
  ): Promise<GeneralResponse<any>> {
    const userId = req.user.userId;
    const result = await this.optimizerService.walkForwardAnalysis(dto, userId);
    return GeneralResponse.success(result);
  }

  @Get('walk-forward/:id')
  @ApiOperation({
    summary: 'Get walk-forward analysis results',
    description: 'Retrieve the results of a walk-forward analysis.',
  })
  @ApiResponse({ status: 200, description: 'Results retrieved' })
  @ApiResponse({ status: 404, description: 'Analysis not found' })
  async getWalkForwardResults(
    @Param('id') id: string,
  ): Promise<GeneralResponse<any>> {
    const result = await this.optimizerService.getWalkForwardResults(id);
    return GeneralResponse.success(result);
  }
}
