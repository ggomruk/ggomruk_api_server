import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OptimizeStrategyDTO } from './dto/optimize-strategy.dto';
import { CompareStrategiesDTO } from './dto/compare-strategies.dto';
import { WalkForwardDTO } from './dto/walk-forward.dto';
import { BacktestService } from '../backtest/backtest.service';
import { BacktestPubSubService } from 'src/domain/redis/messageQueue/backtest-pubsub.service';
import { v4 as uuidv4 } from 'uuid';
import { OptimizationTaskService } from './service/optimizationTask.service';
import { OptimizationResultService } from './service/optimizationResult.service';

export interface OptimizationResponse {
  optimizationId: string;
  status: string;
  params: any;
  result?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class OptimizerService implements OnModuleInit {
  private readonly logger = new Logger(OptimizerService.name);

  constructor(
    private readonly backtestService: BacktestService,
    private readonly backtestPubSub: BacktestPubSubService,
    private readonly optimizationTaskService: OptimizationTaskService,
    private readonly optimizationResultService: OptimizationResultService,
  ) {}

  onModuleInit() {
    this.backtestPubSub.onOptimizationComplete(async (data) => {
      this.logger.log(
        `Optimization ${data.optimizationId} completed. Updating database.`,
      );
      try {
        await this.optimizationTaskService.updateOptimizationStatus(
          data.optimizationId,
          'completed',
          data.resultId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to update optimization status: ${error.message}`,
        );
      }
    });
  }

  /**
   * Strategy Optimizer - Grid search to find optimal parameters
   */
  async optimizeStrategy(
    dto: OptimizeStrategyDTO,
    userId: string,
  ): Promise<{ optimizationId: string }> {
    const optimizationId = uuidv4();

    this.logger.log(`Starting optimization ${optimizationId}`);

    const optimizationParams = {
      symbol: dto.symbol,
      interval: dto.interval,
      startDate: dto.startDate,
      endDate: dto.endDate,
      strategies: [
        {
          id: dto.strategies[0],
          type: dto.strategies[0],
          parameters: dto.paramRanges.map((p) => ({
            name: p.name,
            min: Number(p.min),
            max: Number(p.max),
            step: Number(p.step),
          })),
        },
      ],
      metric: dto.metric || 'sharpe_ratio',
      leverage: dto.leverage || 1,
      tc: dto.commission || 0.001,
      usdt: dto.usdt || 10000,
    };

    // Save to DB
    await this.optimizationTaskService.createOptimizationTask(
      optimizationId,
      userId,
      optimizationParams,
    );

    // Publish to Redis
    try {
      await this.backtestPubSub.publishOptimizationTask({
        optimizationId,
        userId,
        params: optimizationParams,
      });

      this.logger.log(`Optimization task published for ${optimizationId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish optimization task: ${error.message}`,
      );
      await this.optimizationTaskService.updateOptimizationStatus(
        optimizationId,
        'failed',
        undefined,
        error.message,
      );
      throw error;
    }

    return { optimizationId };
  }

  /**
   * Get optimization status and results
   */
  async getOptimizationStatus(
    optimizationId: string,
  ): Promise<OptimizationResponse | null> {
    const task =
      await this.optimizationTaskService.getOptimizationTask(optimizationId);
    if (!task) return null;

    let result = null;
    if (task.status === 'completed' && task.resultId) {
      result = await this.optimizationResultService.getOptimizationResult(
        task.optimizationId,
      );
    }

    return {
      optimizationId: task.optimizationId,
      status: task.status,
      params: task.params,
      result: result,
      createdAt: (task as any).createdAt,
      updatedAt: (task as any).updatedAt,
    };
  }

  async getUserOptimizations(userId: string): Promise<OptimizationResponse[]> {
    const tasks =
      await this.optimizationTaskService.getUserOptimizationTasks(userId);
    return tasks.map((task) => ({
      optimizationId: task.optimizationId,
      status: task.status,
      params: task.params,
      resultId: task.resultId,
      createdAt: (task as any).createdAt,
      updatedAt: (task as any).updatedAt,
    }));
  }

  /**
   * Compare multiple backtest results
   */
  async compareStrategies(dto: CompareStrategiesDTO): Promise<any> {
    const backtests = await Promise.all(
      dto.backtestIds.map((id) => this.backtestService.getBacktestById(id)),
    );

    // Filter out null results
    const validBacktests = backtests.filter((bt) => bt !== null);

    if (validBacktests.length === 0) {
      throw new Error('No valid backtests found');
    }

    // Extract metrics for comparison
    const comparison = validBacktests.map((bt) => {
      const result = bt.result as any;
      const leveragedPerf =
        result?.levered_performance || result?.leveragedPerformance || {};
      const performance = result?.performance || {};

      return {
        backtestId: bt._id,
        strategyName:
          result?.strategy_name || result?.strategyName || 'Unknown',
        params: bt.backtestParams,
        metrics: {
          total_return:
            leveragedPerf.total_return || leveragedPerf.totalReturn || 0,
          sharpe_ratio:
            leveragedPerf.sharpe_ratio || leveragedPerf.sharpeRatio || 0,
          max_drawdown:
            leveragedPerf.max_drawdown || leveragedPerf.maxDrawdown || 0,
          win_rate: performance.win_rate || performance.winRate || 0,
          profit_factor:
            performance.profit_factor || performance.profitFactor || 0,
          total_trades:
            performance.total_trades || performance.totalTrades || 0,
          avg_trade_return:
            performance.avg_trade_return || performance.avgTradeReturn || 0,
        },
      };
    });

    // Calculate rankings
    const metricsToRank = dto.metrics || [
      'total_return',
      'sharpe_ratio',
      'win_rate',
    ];
    const rankings = this.calculateRankings(comparison, metricsToRank);

    return {
      comparison,
      rankings,
      summary: {
        bestOverall: rankings[0],
        totalCompared: comparison.length,
      },
    };
  }

  /**
   * Walk-Forward Analysis
   * NOW: Publishes single task to analytics server (NEW REDIS CHANNEL)
   */
  async walkForwardAnalysis(
    dto: WalkForwardDTO,
    userId: string,
  ): Promise<{ analysisId: string }> {
    const analysisId = uuidv4();

    this.logger.log(`Starting walk-forward analysis ${analysisId}`);

    // Publish walk-forward task to analytics server (NEW APPROACH)
    // Analytics server will generate windows and run train/test backtests in parallel
    try {
      await this.backtestPubSub.publishWalkForwardTask({
        analysisId,
        userId,
        params: {
          symbol: dto.symbol,
          interval: dto.interval,
          startDate: dto.startDate,
          endDate: dto.endDate,
          strategy: dto.strategy,
          strategyParams: dto.strategyParams || {},
          trainingWindow: dto.trainingWindow,
          testingWindow: dto.testingWindow,
          stepSize: dto.stepSize,
          leverage: dto.leverage || 1,
          commission: dto.commission || 0.001,
          usdt: dto.usdt || 10000,
        },
      });

      this.logger.log(`Walk-forward task published for ${analysisId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish walk-forward task: ${error.message}`,
      );
      throw error;
    }

    return { analysisId };
  }

  /**
   * Get walk-forward analysis results
   * NOW: Fetches from MongoDB (analytics server saves results there)
   */
  async getWalkForwardResults(analysisId: string): Promise<any> {
    try {
      const result =
        await this.backtestService.getWalkForwardResult(analysisId);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch walk-forward result: ${error.message}`,
      );
      return null;
    }
  }

  // =============== Private Helper Methods ===============

  private calculateRankings(comparison: any[], metrics: string[]): any[] {
    // Calculate score for each backtest
    const scored = comparison.map((bt) => {
      let totalScore = 0;
      metrics.forEach((metric) => {
        const value = bt.metrics[metric] || 0;
        totalScore += value;
      });
      return {
        ...bt,
        totalScore,
      };
    });

    // Sort by total score descending
    return scored.sort((a, b) => b.totalScore - a.totalScore);
  }
} // End of class
