import { Injectable, Logger } from '@nestjs/common';
import { OptimizeStrategyDTO } from './dto/optimize-strategy.dto';
import { CompareStrategiesDTO } from './dto/compare-strategies.dto';
import { WalkForwardDTO } from './dto/walk-forward.dto';
import { BacktestService } from 'src/common/database/service/backtest.service';
import { BacktestPubSubService } from 'src/domain/redis/messageQueue/backtest-pubsub.service';
import { v4 as uuidv4 } from 'uuid';

export interface OptimizationResult {
  optimizationId: string;
  status: 'running' | 'completed' | 'failed';
  totalCombinations: number;
  completedCombinations: number;
  bestParams?: any;
  bestMetricValue?: number;
  allResults?: any[];
}

@Injectable()
export class OptimizerService {
  private readonly logger = new Logger(OptimizerService.name);
  private optimizations = new Map<string, OptimizationResult>();

  constructor(
    private readonly backtestService: BacktestService,
    private readonly backtestPubSub: BacktestPubSubService,
  ) {}

  /**
   * Strategy Optimizer - Grid search to find optimal parameters
   * NOW: Publishes single task to analytics server (NEW REDIS CHANNEL)
   */
  async optimizeStrategy(dto: OptimizeStrategyDTO, userId: string): Promise<{ optimizationId: string }> {
    const optimizationId = uuidv4();
    
    this.logger.log(`Starting optimization ${optimizationId}`);
    
    // Initialize optimization tracking
    this.optimizations.set(optimizationId, {
      optimizationId,
      status: 'running',
      totalCombinations: 0,
      completedCombinations: 0,
      allResults: [],
    });

    // Publish optimization task to analytics server (NEW APPROACH)
    // Analytics server will generate combinations and run backtests in parallel
    try {
      await this.backtestPubSub.publishOptimizationTask({
        optimizationId,
        userId,
        params: {
          symbol: dto.symbol,
          interval: dto.interval,
          startDate: dto.startDate,
          endDate: dto.endDate,
          strategies: [{
            id: dto.strategies[0],
            type: dto.strategies[0],
            parameters: dto.paramRanges.map(p => ({
              name: p.name,
              min: p.min,
              max: p.max,
              step: p.step
            }))
          }],
          metric: dto.metric || 'sharpe_ratio',
          leverage: dto.leverage || 1,
          tc: dto.commission || 0.001,
          usdt: dto.usdt || 10000,
        },
      });

      this.logger.log(`Optimization task published for ${optimizationId}`);
    } catch (error) {
      this.logger.error(`Failed to publish optimization task: ${error.message}`);
      const opt = this.optimizations.get(optimizationId);
      if (opt) {
        opt.status = 'failed';
      }
      throw error;
    }

    return { optimizationId };
  }

  /**
   * Get optimization status and results
   * NOW: Fetches from MongoDB (analytics server saves results there)
   */
  async getOptimizationStatus(optimizationId: string): Promise<OptimizationResult | null> {
    // First check in-memory (for status tracking)
    const inMemory = this.optimizations.get(optimizationId);
    
    // Try to fetch completed results from MongoDB
    try {
      const result = await this.backtestService.getOptimizationResult(optimizationId);
      
      if (result) {
        // Convert from MongoDB format to our interface
        return {
          optimizationId: result.optimizationId,
          status: result.status || 'completed',
          totalCombinations: result.totalCombinations || 0,
          completedCombinations: result.successfulCombinations || 0,
          bestParams: result.bestParameters,
          bestMetricValue: result.bestMetricValue,
          allResults: result.topResults || [],
        };
      }
    } catch (error) {
      this.logger.error(`Failed to fetch optimization result: ${error.message}`);
    }
    
    // Fallback to in-memory status
    return inMemory || null;
  }

  /**
   * Compare multiple backtest results
   */
  async compareStrategies(dto: CompareStrategiesDTO): Promise<any> {
    const backtests = await Promise.all(
      dto.backtestIds.map(id => this.backtestService.getBacktestById(id))
    );

    // Filter out null results
    const validBacktests = backtests.filter(bt => bt !== null);

    if (validBacktests.length === 0) {
      throw new Error('No valid backtests found');
    }

    // Extract metrics for comparison
    const comparison = validBacktests.map(bt => {
      const result = bt.result as any;
      const leveragedPerf = result?.levered_performance || result?.leveragedPerformance || {};
      const performance = result?.performance || {};

      return {
        backtestId: bt._id,
        strategyName: result?.strategy_name || result?.strategyName || 'Unknown',
        params: bt.backtestParams,
        metrics: {
          total_return: leveragedPerf.total_return || leveragedPerf.totalReturn || 0,
          sharpe_ratio: leveragedPerf.sharpe_ratio || leveragedPerf.sharpeRatio || 0,
          max_drawdown: leveragedPerf.max_drawdown || leveragedPerf.maxDrawdown || 0,
          win_rate: performance.win_rate || performance.winRate || 0,
          profit_factor: performance.profit_factor || performance.profitFactor || 0,
          total_trades: performance.total_trades || performance.totalTrades || 0,
          avg_trade_return: performance.avg_trade_return || performance.avgTradeReturn || 0,
        },
      };
    });

    // Calculate rankings
    const metricsToRank = dto.metrics || ['total_return', 'sharpe_ratio', 'win_rate'];
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
  async walkForwardAnalysis(dto: WalkForwardDTO, userId: string): Promise<{ analysisId: string }> {
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
      this.logger.error(`Failed to publish walk-forward task: ${error.message}`);
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
      const result = await this.backtestService.getWalkForwardResult(analysisId);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch walk-forward result: ${error.message}`);
      return null;
    }
  }

  // =============== Private Helper Methods ===============

  private generateParameterCombinations(ranges: any[]): any[] {
    const combinations: any[] = [];
    
    const generate = (index: number, current: any) => {
      if (index === ranges.length) {
        combinations.push({ ...current });
        return;
      }

      const range = ranges[index];
      for (let value = range.min; value <= range.max; value += range.step) {
        current[range.name] = value;
        generate(index + 1, current);
      }
    };

    generate(0, {});
    return combinations;
  }

  private async runOptimization(
    optimizationId: string,
    dto: OptimizeStrategyDTO,
    userId: string,
    combinations: any[]
  ) {
    const results: any[] = [];

    for (const params of combinations) {
      try {
        // Create backtest task
        const backtestId = uuidv4();
        const mergedParams = {
          ...params,
        };

        // Submit backtest
        await this.backtestPubSub.publishTask({
          backtestId,
          userId,
          params: {
            symbol: dto.symbol,
            interval: dto.interval,
            startDate: dto.startDate,
            endDate: dto.endDate,
            leverage: dto.leverage || 1,
            tc: dto.commission || 0.001,
            usdt: dto.usdt || 10000,
            strategies: dto.strategies,
            strategyParams: mergedParams,
          },
        });

        // Store reference
        results.push({
          backtestId,
          params,
        });

        // Update progress
        const opt = this.optimizations.get(optimizationId);
        if (opt) {
          opt.completedCombinations++;
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        this.logger.error(`Failed to run combination: ${error.message}`);
      }
    }

    // Wait for all backtests to complete (polling approach)
    await this.waitForBacktestsCompletion(optimizationId, results, dto.metric);
  }

  private async waitForBacktestsCompletion(optimizationId: string, results: any[], metric: string) {
    const maxWaitTime = 30 * 60 * 1000; // 30 minutes
    const pollInterval = 5000; // 5 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      let allCompleted = true;

      for (const result of results) {
        if (!result.completed) {
          const backtest = await this.backtestService.getBacktestById(result.backtestId);
          if (backtest?.result) {
            result.completed = true;
            result.metricValue = this.extractMetric(backtest.result, metric);
          } else {
            allCompleted = false;
          }
        }
      }

      if (allCompleted) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    // Find best result
    const completedResults = results.filter(r => r.completed);
    if (completedResults.length > 0) {
      const bestResult = completedResults.reduce((best, current) => 
        current.metricValue > best.metricValue ? current : best
      );

      const opt = this.optimizations.get(optimizationId);
      if (opt) {
        opt.status = 'completed';
        opt.bestParams = bestResult.params;
        opt.bestMetricValue = bestResult.metricValue;
        opt.allResults = completedResults;
      }
    }
  }

  private extractMetric(result: any, metric: string): number {
    const leveragedPerf = result.levered_performance || result.leveragedPerformance || {};
    const performance = result.performance || {};

    switch (metric) {
      case 'sharpe':
        return leveragedPerf.sharpe_ratio || 0;
      case 'return':
        return leveragedPerf.total_return || 0;
      case 'profit_factor':
        return performance.profit_factor || 0;
      case 'win_rate':
        return performance.win_rate || 0;
      default:
        return 0;
    }
  }

  private calculateRankings(comparison: any[], metrics: string[]): any[] {
    // Calculate score for each backtest
    const scored = comparison.map(bt => {
      let totalScore = 0;
      metrics.forEach(metric => {
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

  private calculateWalkForwardWindows(
    startDate: Date,
    endDate: Date,
    trainingDays: number,
    testingDays: number,
    stepDays: number
  ): Array<{ trainStart: Date; trainEnd: Date; testStart: Date; testEnd: Date }> {
    const windows: Array<any> = [];
    let currentStart = new Date(startDate);

    while (true) {
      const trainEnd = new Date(currentStart);
      trainEnd.setDate(trainEnd.getDate() + trainingDays);

      const testStart = new Date(trainEnd);
      const testEnd = new Date(testStart);
      testEnd.setDate(testEnd.getDate() + testingDays);

      if (testEnd > endDate) {
        break;
      }

      windows.push({
        trainStart: new Date(currentStart),
        trainEnd: new Date(trainEnd),
        testStart: new Date(testStart),
        testEnd: new Date(testEnd),
      });

      currentStart.setDate(currentStart.getDate() + stepDays);
    }

    return windows;
  }

  private async runWalkForwardAnalysis(
    analysisId: string,
    dto: WalkForwardDTO,
    userId: string,
    windows: any[]
  ) {
    const results: any[] = [];

    for (const window of windows) {
      // Training phase
      const trainBacktestId = uuidv4();
      await this.backtestPubSub.publishTask({
        backtestId: trainBacktestId,
        userId,
        params: {
          symbol: dto.symbol,
          interval: dto.interval,
          startDate: window.trainStart.toISOString(),
          endDate: window.trainEnd.toISOString(),
          leverage: dto.leverage || 1,
          tc: dto.commission || 0.001,
          usdt: dto.usdt || 10000,
          strategies: [dto.strategy],
          strategyParams: dto.strategyParams || {},
        },
      });

      // Testing phase
      const testBacktestId = uuidv4();
      await this.backtestPubSub.publishTask({
        backtestId: testBacktestId,
        userId,
        params: {
          symbol: dto.symbol,
          interval: dto.interval,
          startDate: window.testStart.toISOString(),
          endDate: window.testEnd.toISOString(),
          leverage: dto.leverage || 1,
          tc: dto.commission || 0.001,
          usdt: dto.usdt || 10000,
          strategies: [dto.strategy],
          strategyParams: dto.strategyParams || {},
        },
      });

      results.push({
        window,
        trainBacktestId,
        testBacktestId,
      });

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Store results (in production, save to database)
    this.logger.log(`Walk-forward analysis ${analysisId} completed with ${results.length} windows`);
  }
}
