import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OptimizationResult,
  OptimizationResultDocument,
} from '../schema/optimizationResult.schema';

@Injectable()
export class OptimizationResultRepository {
  constructor(
    @InjectModel(OptimizationResult.name)
    private optimizationResultModel: Model<OptimizationResultDocument>,
  ) {}

  async findOne(optimizationId: string): Promise<OptimizationResult | null> {
    return this.optimizationResultModel.findOne({ optimizationId }).exec();
  }

  async findByUserId(userId: string): Promise<OptimizationResult[]> {
    return this.optimizationResultModel
      .find({ userId })
      .sort({ completedAt: -1 })
      .exec();
  }
}
