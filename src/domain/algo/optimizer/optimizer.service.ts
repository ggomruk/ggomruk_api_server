import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OptimizeStrategyDTO } from './dto/optimize-strategy.dto';
import { CompareStrategiesDTO } from './dto/compare-strategies.dto';
import { WalkForwardDTO } from './dto/walk-forward.dto';
import { BacktestService } from '../backtest/backtest.service';
import { BacktestPubSubService } from 'src/domain/redis/messageQueue/backtest-pubsub.service';
import { v4 as uuidv4 } from 'uuid';
import { OptimizationTaskService } from './service/optimizationTask.service';
import { OptimizationResultService } from './service/optimizationResult.service';
import { Types } from 'mongoose';

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
      strategies: dto.strategies.map((s) => ({
        id: s.id,
        type: s.type,
        parameters: s.parameters.map((p) => ({
          name: p.name,
          min: Number(p.min),
          max: Number(p.max),
          step: Number(p.step),
        })),
      })),
      metric: dto.metric || 'sharpe',
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

    // Fetch full results from backtestResults collection using _id
    const backtest_results = await Promise.all(
      validBacktests.map(async (bt) => {
        const resultId = bt.result?.resultId;
        if (!resultId) {
          this.logger.warn(
            `Backtest ${bt._id} (uid: ${bt.uid}) has no resultId`,
          );
          return null;
        }

        try {
          // Use backtestService to fetch detailed result (handles collection name and ID types)
          const fullResultWrapper =
            await this.backtestService.getBacktestDetailedResult(resultId);

          if (!fullResultWrapper) {
            this.logger.warn(
              `No detailed result found for resultId ${resultId}`,
            );
            return null;
          }

          return { backtest: bt, fullResult: fullResultWrapper.result };
        } catch (error) {
          this.logger.error(
            `Failed to fetch result for backtest ${bt._id}: ${error.message}`,
          );
          return null;
        }
      }),
    );

    const validResults = backtest_results.filter((r) => r !== null);

    if (validResults.length === 0) {
      throw new Error('No valid backtest results found');
    }

    // Extract metrics for comparison
    const comparison = validResults.map(({ backtest, fullResult }) => {
      const result = fullResult as any;

      const leveragedPerf =
        result?.levered_performance || result?.leveragedPerformance || {};
      const performance = result?.performance || {};

      // Calculate total_return from cstrategy (cumulative multiple)
      // cstrategy = 1.25 -> 25% return
      const totalReturn = leveragedPerf.cstrategy
        ? (leveragedPerf.cstrategy - 1) * 100
        : 0;

      return {
        backtestId: backtest._id,
        strategyName:
          result?.strategy_name || result?.strategyName || 'Unknown',
        params: backtest.backtestParams,
        metrics: {
          total_return: totalReturn,
          sharpe_ratio: leveragedPerf.sharpe || performance.sharpe || 0,
          max_drawdown: Math.abs(performance.max_drawdown || 0) * 100, // Convert to percentage
          win_rate: (performance.win_rate || 0) * 100, // Convert to percentage
          profit_factor: performance.profit_factor || 0,
          total_trades: performance.trades || 0,
          avg_trade_return: 0, // Not available in Python output yet
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
