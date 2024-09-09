import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IStrategies, StrategiesDocument, StrategiesSchema } from "./strategeisSchema/strategies.schema";
import mongoose, { Document } from 'mongoose';


export interface ISignalParams {
    symbol: string;
    interval: string;
    strategies: IStrategies;
}

@Schema({timestamps: false, collection: 'signal'})
export class SignalDocument extends Document implements ISignalParams {
    @Prop({ required: true, type: String })
    symbol: string;

    @Prop({ required: true, type: String })
    interval: string;

    @Prop({ required: true, type: StrategiesSchema })
    strategies: StrategiesDocument;
}

export const SignalSchema = SchemaFactory.createForClass<ISignalParams>(SignalDocument);

export const SingalModel = mongoose.model<SignalDocument>('Signal', SignalSchema);