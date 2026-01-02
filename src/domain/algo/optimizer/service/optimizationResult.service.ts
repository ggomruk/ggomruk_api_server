import { Injectable } from '@nestjs/common';
import { OptimizationResultRepository } from '../repository/optimizationResult.repository';
import { OptimizationResult } from '../schema/optimizationResult.schema';

@Injectable()
export class OptimizationResultService {
  constructor(
    private readonly optimizationResultRepository: OptimizationResultRepository,
  ) {}

  async getOptimizationResult(
    optimizationId: string,
  ): Promise<OptimizationResult | null> {
    return this.optimizationResultRepository.findOne(optimizationId);
  }
}
