import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OptimizationTask, OptimizationTaskDocument } from '../schema/optimizationTask.schema';

@Injectable()
export class OptimizationTaskRepository {
    constructor(
        @InjectModel(OptimizationTask.name) private optimizationTaskModel: Model<OptimizationTaskDocument>
    ) { }

    async create(optimizationTask: Partial<OptimizationTask>): Promise<OptimizationTask> {
        const createdTask = new this.optimizationTaskModel(optimizationTask);
        return createdTask.save();
    }

    async findOne(optimizationId: string): Promise<OptimizationTask | null> {
        return this.optimizationTaskModel.findOne({ optimizationId }).exec();
    }

    async findByUserId(userId: string): Promise<OptimizationTask[]> {
        return this.optimizationTaskModel.find({ userId }).sort({ createdAt: -1 }).exec();
    }

    async updateStatus(optimizationId: string, status: string, resultId?: string, error?: string): Promise<OptimizationTask | null> {
        const update: any = { status };
        if (resultId) update.resultId = resultId;
        if (error) update.error = error;
        
        return this.optimizationTaskModel.findOneAndUpdate(
            { optimizationId },
            update,
            { new: true }
        ).exec();
    }
}
