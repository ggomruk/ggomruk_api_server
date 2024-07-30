import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { I_BB, BBSchema, BBDocument } from './bb.schema';
import { I_MACD, MACDDocument, MACDSchema } from './macd.schema';
import { I_RSI, RSIDocument, RSISchema } from './rsi.schema';
import { I_RV, RVDocument, RVSchema } from './rv.schema';
import { I_SMA, SMADocument, SMASchema } from './sma.schema';
import { I_SO, SODocument, SOSchema } from './so.schema';
import mongoose, { Document } from 'mongoose';

export interface IStrategies {
    bb: I_BB;
    macd: I_MACD;
    rsi: I_RSI;
    rv: I_RV;
    sma: I_SMA;
    so: I_SO;
};

@Schema({timestamps: false})
export class StrategiesDocument extends Document implements IStrategies {
    @Prop({ required: false, type: BBSchema })
    bb: BBDocument;
    @Prop({ required: false, type: MACDSchema })
    macd: MACDDocument;
    @Prop({ required: false, type: RSISchema })
    rsi: RSIDocument;
    @Prop({ required: false, type: RVSchema })
    rv: RVDocument;
    @Prop({ required: false, type: SMASchema })
    sma: SMADocument;
    @Prop({ required: false, type: SOSchema })
    so: SODocument;
}

export const StrategiesSchema = SchemaFactory.createForClass<IStrategies>(StrategiesDocument);
export const StrategiesModel = mongoose.model<StrategiesDocument>('Result', StrategiesSchema);
