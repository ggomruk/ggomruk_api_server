interface I_BB {
  window: number;
  numStdDev: number;
}
interface I_MACD {
  fast: number;
  slow: number;
  signal: number;
}
interface I_RSI {
  window: number;
  overbought: number;
  oversold: number;
}
interface I_RV {
  reuturnLow: number;
  returnHigh: number;
  volumeLow: number;
  volumeHigh: number;
}
interface I_SMA {
  short: number;
  medium: number;
  long: number;
}
interface I_SO {
  kWindow: number;
  dWindow: number;
}

export type StrategyParams = I_BB | I_MACD | I_RSI | I_RV | I_SMA | I_SO;
