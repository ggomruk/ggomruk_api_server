import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { I_BB, BBSchema, BB } from './bb.schema';
import { I_MACD, MACD, MACDSchema } from './macd.schema';
import { I_RSI, RSI, RSISchema } from './rsi.schema';
import { I_RV, RV, RVSchema } from './rv.schema';
import { I_SMA, SMA, SMASchema } from './sma.schema';
import { I_SO, SO, SOSchema } from './so.schema';
import { Document } from 'mongoose';

export interface IStrategies {
    bb: I_BB;
    macd: I_MACD;
    rsi: I_RSI;
    rv: I_RV;
    sma: I_SMA;
    so: I_SO;
};

@Schema({timestamps: false})
export class Strategies extends Document implements IStrategies {
    @Prop({ required: false, type: BBSchema })
    bb: BB;
    @Prop({ required: false, type: MACDSchema })
    macd: MACD;
    @Prop({ required: false, type: RSISchema })
    rsi: RSI;
    @Prop({ required: false, type: RVSchema })
    rv: RV;
    @Prop({ required: false, type: SMASchema })
    sma: SMA;
    @Prop({ required: false, type: SOSchema })
    so: SO;
}

export const StrategiesSchema = SchemaFactory.createForClass<IStrategies>(Strategies);
