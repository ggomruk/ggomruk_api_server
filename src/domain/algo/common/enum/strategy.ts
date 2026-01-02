export enum E_StrategyNames {
  BB = 'BB',
  MACD = 'MACD',
  RSI = 'RSI',
  RV = 'RV',
  SMA = 'SMA',
  SO = 'SO',
}

export function isValidStrategyName(strategyName: string): boolean {
  return Object.values(E_StrategyNames).includes(
    strategyName.toUpperCase() as E_StrategyNames,
  );
}
