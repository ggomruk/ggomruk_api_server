import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from 'mongoose';

export interface IOptimizationStrategyParam {
    name: string;
    min: number;
    max: number;
    step: number;
}

export interface IOptimizationStrategy {
    id: string;
    type: string;
    parameters: IOptimizationStrategyParam[];
}

export interface IOptimizationParams {
    symbol: string;
    interval: string;
    startDate: string;
    endDate: string;
    strategies: IOptimizationStrategy[];
}

@Schema({ _id: false })
class OptimizationStrategyParamSchema extends Document implements IOptimizationStrategyParam {
    @Prop({ required: true })
    name: string;
    @Prop({ required: true })
    min: number;
    @Prop({ required: true })
    max: number;
    @Prop({ required: true })
    step: number;
}

@Schema({ _id: false })
class OptimizationStrategySchema extends Document implements IOptimizationStrategy {
    @Prop({ required: true })
    id: string;
    @Prop({ required: true })
    type: string;
    @Prop({ type: [SchemaFactory.createForClass(OptimizationStrategyParamSchema)] })
    parameters: OptimizationStrategyParamSchema[];
}

@Schema({ _id: false })
class OptimizationParamsSchema extends Document implements IOptimizationParams {
    @Prop({ required: true })
    symbol: string;
    @Prop({ required: true })
    interval: string;
    @Prop({ required: true })
    startDate: string;
    @Prop({ required: true })
    endDate: string;
    @Prop({ type: [SchemaFactory.createForClass(OptimizationStrategySchema)] })
    strategies: OptimizationStrategySchema[];
}

export type OptimizationTaskDocument = OptimizationTask & Document;

@Schema({ timestamps: true, collection: 'optimization_tasks' })
export class OptimizationTask {
    @Prop({ required: true, unique: true })
    optimizationId: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ type: SchemaFactory.createForClass(OptimizationParamsSchema), required: true })
    params: OptimizationParamsSchema;

    @Prop({ required: true, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' })
    status: string;

    @Prop()
    resultId?: string;

    @Prop()
    error?: string;
}

export const OptimizationTaskSchema = SchemaFactory.createForClass(OptimizationTask);
OptimizationTaskSchema.index({ userId: 1, createdAt: -1 });
