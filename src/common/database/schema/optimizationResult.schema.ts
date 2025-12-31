import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from 'mongoose';

@Schema({ _id: false })
class OptimizationPerformanceSchema extends Document {
    @Prop()
    total_return: number;
    @Prop()
    sharpe_ratio: number;
    @Prop()
    max_drawdown: number;
    @Prop()
    win_rate: number;
    @Prop()
    profit_factor: number;
    @Prop()
    cagr: number;
    @Prop()
    final_equity: number;
}

@Schema({ _id: false })
class OptimizationTopResultSchema extends Document {
    @Prop()
    rank: number;
    @Prop({ type: mongoose.Schema.Types.Mixed })
    parameters: any;
    @Prop()
    metric_value: number;
    @Prop({ type: mongoose.Schema.Types.Mixed })
    performance: any;
}

export type OptimizationResultDocument = OptimizationResult & Document;

@Schema({ timestamps: true, collection: 'optimization_results' })
export class OptimizationResult {
    @Prop({ required: true })
    optimizationId: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ type: mongoose.Schema.Types.Mixed })
    params: any;

    @Prop()
    totalCombinations: number;

    @Prop()
    successfulCombinations: number;

    @Prop({ type: [OptimizationTopResultSchema] })
    topResults: OptimizationTopResultSchema[];

    @Prop({ type: mongoose.Schema.Types.Mixed })
    bestParameters: any;

    @Prop()
    bestMetricValue: number;

    @Prop()
    status: string;

    @Prop()
    completedAt: string;
}

export const OptimizationResultSchema = SchemaFactory.createForClass(OptimizationResult);
OptimizationResultSchema.index({ optimizationId: 1 });
OptimizationResultSchema.index({ userId: 1 });
