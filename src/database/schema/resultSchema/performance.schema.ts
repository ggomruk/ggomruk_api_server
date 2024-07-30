import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


export interface IPerformance {
    leverageApplied: number;
    sharpe: number;
    cstrategy: number;
    bh: number;
    cagr: number;
    annMean: number;
    annStd: number;
    trades: number;
    initialUsdt: number;
    finalUsdt: number;
}

export class Performance extends Document implements IPerformance {
    @Prop({ required: true, type: Number })
    leverageApplied: number;
    
    @Prop({ required: true, type: Number })
    sharpe: number;
    
    @Prop({ required: true, type: Number })
    cstrategy: number;
    
    @Prop({ required: true, type: Number })
    bh: number;
    
    @Prop({ required: true, type: Number })
    cagr: number;
    
    @Prop({ required: true, type: Number })
    annMean: number;
    
    @Prop({ required: true, type: Number })
    annStd: number;
    
    @Prop({ required: true, type: Number })
    trades: number;
    
    @Prop({ required: true, type: Number })
    initialUsdt: number;
    
    @Prop({ required: true, type: Number })
    finalUsdt: number;
}

export const PerformanceSchema = SchemaFactory.createForClass<IPerformance>(Performance);