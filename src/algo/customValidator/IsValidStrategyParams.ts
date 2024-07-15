import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { BacktestDTO } from '../dto/backtest.dto';
import { E_StrategyNames } from '../enum/strategy';
import {
  BBParamsValidator,
  MACDParamsValidator,
  RSIParamsValidator,
  RVParamsValidator,
  SMAParamsValidator,
  SOParamsValidator,
} from './validatorTypes';

export function ValidStrategyParams(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'ValidStrategyParams',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const object = args.object as BacktestDTO;
          switch (object.strategyName) {
            case E_StrategyNames.BB:
              return new BBParamsValidator().validate(value, args);
            case E_StrategyNames.MACD:
              return new MACDParamsValidator().validate(value, args);
            case E_StrategyNames.RSI:
              return new RSIParamsValidator().validate(value, args);
            case E_StrategyNames.RV:
              return new RVParamsValidator().validate(value, args);
            case E_StrategyNames.SMA:
              return new SMAParamsValidator().validate(value, args);
            case E_StrategyNames.SO:
              return new SOParamsValidator().validate(value, args);
          }
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const object = args.object as BacktestDTO;
          switch (object.strategyName) {
            case E_StrategyNames.BB:
              return new BBParamsValidator().defaultMessage();
            case E_StrategyNames.MACD:
              return new MACDParamsValidator().defaultMessage();
            case E_StrategyNames.RSI:
              return new RSIParamsValidator().defaultMessage();
            case E_StrategyNames.RV:
              return new RVParamsValidator().defaultMessage();
            case E_StrategyNames.SMA:
              return new SMAParamsValidator().defaultMessage();
            case E_StrategyNames.SO:
              return new SOParamsValidator().defaultMessage();
          }
          return 'Invalid strategy';
        },
      },
    });
  };
}
