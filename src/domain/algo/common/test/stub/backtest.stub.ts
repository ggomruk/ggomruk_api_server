export const validBacktestBody = {
  symbol: 'BTCUSDT',
  usdt: 10000,
  interval: '1m',
  startDate: '2024-01-15T02:00:00',
  endDate: '2024-07-01T02:00:00',
  tc: 0.00085,
  strategies: {
    RSI: {
      periods: 14,
      rsi_upper: 70,
      rsi_lower: 30,
    },
    SMA: {
      sma_s: 5,
      sma_m: 100,
      sma_l: 180,
    },
    RV: {
      return_thresh_low: -0.01,
      return_thresh_high: 0.01,
      volume_thresh_low: -0.5,
      volume_thresh_high: 0.5,
    },
  },
  leverage: 3,
};

export const invalidBacktestBody = {
  symbol: 'BTCUSDT',
  usdt: 10000,
  interval: '1m',
  startDate: '2024-01-15T02:00:00',
  endDate: '2024-07-01T02:00:00',
  tc: 0.00085,
  strategies: {
    RSI: {
      rsi_upper: 70,
      rsi_lower: 30,
    },
    SMA: {
      sma_m: 100,
      sma_l: 180,
    },
    RV: {
      return_thresh_high: 0.01,
      volume_thresh_low: -0.5,
      volume_thresh_high: 0.5,
    },
  },
  leverage: 3,
};
