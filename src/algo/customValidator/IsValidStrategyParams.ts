import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { BacktestDto } from '../dto/backtest.dto';
import { StrategyNames } from '../enum/strategy';
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
          const object = args.object as BacktestDto;
          switch (object.strategyName) {
            case StrategyNames.BB:
              return new BBParamsValidator().validate(value, args);
            case StrategyNames.MACD:
              return new MACDParamsValidator().validate(value, args);
            case StrategyNames.RSI:
              return new RSIParamsValidator().validate(value, args);
            case StrategyNames.RV:
              return new RVParamsValidator().validate(value, args);
            case StrategyNames.SMA:
              return new SMAParamsValidator().validate(value, args);
            case StrategyNames.SO:
              return new SOParamsValidator().validate(value, args);
          }
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const object = args.object as BacktestDto;
          switch (object.strategyName) {
            case StrategyNames.BB:
              return new BBParamsValidator().defaultMessage();
            case StrategyNames.MACD:
              return new MACDParamsValidator().defaultMessage();
            case StrategyNames.RSI:
              return new RSIParamsValidator().defaultMessage();
            case StrategyNames.RV:
              return new RVParamsValidator().defaultMessage();
            case StrategyNames.SMA:
              return new SMAParamsValidator().defaultMessage();
            case StrategyNames.SO:
              return new SOParamsValidator().defaultMessage();
          }
          return 'Invalid strategy';
        },
      },
    });
  };
}
