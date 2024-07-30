
import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export interface ILeveragedPerformance {
    leverageApplied: number;
    sharpe: number;
    cstrategy: number;
    cagr: number;
    annMean: number;
    annStd: number;
    finalUsdtLeveraged: number;
}

export class LeveragedPerformance extends Document implements ILeveragedPerformance {
    @Prop({ required: true, type: Number })
    leverageApplied: number;
    
    @Prop({ required: true, type: Number })
    sharpe: number;
    
    @Prop({ required: true, type: Number })
    cstrategy: number;
    
    @Prop({ required: true, type: Number })
    cagr: number;
    
    @Prop({ required: true, type: Number })
    annMean: number;
    
    @Prop({ required: true, type: Number })
    annStd: number;
    
    @Prop({ required: true, type: Number })
    finalUsdtLeveraged: number;
}

export const LeveragedPerformanceSchema = SchemaFactory.createForClass<ILeveragedPerformance>(LeveragedPerformance);