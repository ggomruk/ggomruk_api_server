interface BB {
  window: number;
  numStdDev: number;
}
interface MACD {
  fast: number;
  slow: number;
  signal: number;
}
interface RSI {
  window: number;
  overbought: number;
  oversold: number;
}
interface RV {
  reuturnLow: number;
  returnHigh: number;
  volumeLow: number;
  volumeHigh: number;
}
interface SMA {
  short: number;
  medium: number;
  long: number;
}
interface SO {
  kWindow: number;
  dWindow: number;
}

export type StrategyParams = BB | MACD | RSI | RV | SMA | SO;
