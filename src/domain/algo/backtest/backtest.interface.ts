export interface BacktestRequest {
  symbol: string;
  interval: string;
  startDate: string;
  endDate: string;
  usdt: number;
  tc: number;
  leverage: number;
  strategyParams: {
    strategies: {
      [key: string]: any;
    };
  };
}

export interface BacktestResponse {
  backtestId: string;
  strategyName: string;
  leverageApplied: number;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  winRate: number;
  finalBalance: number;
  performance: any;
  leveredPerformance: any;
}

export interface TradeMarker {
  time: number;
  position: 'belowBar' | 'aboveBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown';
  text: string;
  size: number;
}
