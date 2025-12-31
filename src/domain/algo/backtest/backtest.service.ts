import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BacktestRequest, BacktestResponse } from './backtest.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BacktestService {
  private readonly logger = new Logger(BacktestService.name);
  private readonly pythonServerUrl: string;

  constructor(private configService: ConfigService) {
    // Get Python backtest server URL from env or use default
    this.pythonServerUrl = this.configService.get<string>(
      'PYTHON_BACKTEST_URL',
      'http://localhost:5001',
    );
    this.logger.log(`Python Backtest Server: ${this.pythonServerUrl}`);
  }

  async runBacktest(
    backtestRequest: BacktestRequest,
    userId: string,
  ): Promise<BacktestResponse> {
    const backtestId = uuidv4();

    try {
      this.logger.log(
        `Running backtest ${backtestId} for user ${userId}: ${backtestRequest.symbol} ${backtestRequest.interval}`,
      );

      // Prepare request for Python server
      const pythonRequest = {
        backtestId,
        userId,
        symbol: backtestRequest.symbol,
        interval: backtestRequest.interval,
        startDate: backtestRequest.startDate,
        endDate: backtestRequest.endDate,
        usdt: backtestRequest.usdt,
        tc: backtestRequest.tc,
        leverage: backtestRequest.leverage,
        strategyParams: backtestRequest.strategyParams,
      };

      // Call Python backtest service
      const response = await axios.post(
        `${this.pythonServerUrl}/backtest`,
        pythonRequest,
        {
          timeout: 60000, // 60 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const result = response.data;

      // Transform Python response to frontend format
      const backtestResponse: BacktestResponse = {
        backtestId,
        strategyName: result.strategy_name || 'Unknown',
        leverageApplied: result.leverage_applied || 1,
        totalReturn: result.levered_performance?.total_return_pct || 0,
        sharpeRatio: result.performance?.sharpe_ratio || 0,
        maxDrawdown: result.performance?.max_drawdown || 0,
        totalTrades: result.performance?.total_trades || 0,
        winRate: result.performance?.win_rate || 0,
        finalBalance: result.levered_performance?.final_balance || 0,
        performance: result.performance,
        leveredPerformance: result.levered_performance,
      };

      this.logger.log(`Backtest ${backtestId} completed successfully`);
      return backtestResponse;
    } catch (error) {
      this.logger.error(
        `Backtest ${backtestId} failed: ${error.message}`,
        error.stack,
      );

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new HttpException(
            'Python backtest server is not running',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        throw new HttpException(
          error.response?.data?.message || 'Backtest failed',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Internal server error during backtest',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBacktestHistory(userId: string): Promise<any[]> {
    try {
      // This would typically query MongoDB for user's backtest history
      // For now, return empty array
      this.logger.log(`Fetching backtest history for user ${userId}`);
      return [];
    } catch (error) {
      this.logger.error(
        `Failed to fetch backtest history: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to fetch backtest history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
