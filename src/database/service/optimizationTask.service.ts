import { Injectable } from '@nestjs/common';
import { OptimizationTaskRepository } from '../repository/optimizationTask.repository';
import { OptimizationTask } from '../schema/optimizationTask.schema';

@Injectable()
export class OptimizationTaskService {
    constructor(private readonly optimizationTaskRepository: OptimizationTaskRepository) { }

    async createOptimizationTask(
        optimizationId: string,
        userId: string,
        params: any
    ): Promise<OptimizationTask> {
        return this.optimizationTaskRepository.create({
            optimizationId,
            userId,
            params,
            status: 'pending'
        });
    }

    async getOptimizationTask(optimizationId: string): Promise<OptimizationTask | null> {
        return this.optimizationTaskRepository.findOne(optimizationId);
    }

    async getUserOptimizationTasks(userId: string): Promise<OptimizationTask[]> {
        return this.optimizationTaskRepository.findByUserId(userId);
    }

    async updateOptimizationStatus(
        optimizationId: string,
        status: string,
        resultId?: string,
        error?: string
    ): Promise<OptimizationTask | null> {
        return this.optimizationTaskRepository.updateStatus(optimizationId, status, resultId, error);
    }
}
