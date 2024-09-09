import { IsNotEmpty, IsString } from "class-validator";
import { ValidStrategyParams } from "../customValidator/IsValidStrategyParams";
import { E_StrategyNames } from "../enum/strategy";
import { BB, MACD, RSI, RV, SMA, SO } from "../customValidator/validatorTypes";
import { ISignalParams } from "src/database/schema/signal.schema";

export class SignalDTO {
    @IsNotEmpty()
    @IsString()
    symbol: string;

    @IsNotEmpty()
    @IsString()
    interval: string;

    @IsNotEmpty()
    @ValidStrategyParams({
        message: 'Invalid strategy parameters for the given strategy name',
    })
    strategies: Record<E_StrategyNames, BB|MACD|RSI|RV|SMA|SO>;

    toSignalParams() : ISignalParams {
        let strategies = {}
        for (const strategy in this.strategies) {
            let params = this.strategies[strategy]
            strategies[strategy.toLowerCase()] = params
        }
        return {
            symbol: this.symbol,
            interval: this.interval,
            strategies: strategies
        }
    }
    
}