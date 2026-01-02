import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BacktestDocument, IBacktest } from './schemas/backtest.schema';

@Injectable()
export class BacktestSchemaRepository {
  private readonly logger = new Logger(BacktestSchemaRepository.name);

  constructor(
    @InjectModel('Backtest')
    private readonly backtestModel: Model<BacktestDocument>,
  ) {}

  async findByUid(uid: string): Promise<BacktestDocument> {
    const query = { uid };
    const result = await this.backtestModel.findOne(query);
    return result;
  }

  async insertData(data: IBacktest) {
    const result = await this.backtestModel.create(data);
    return result;
  }

  async upsertData(data: IBacktest) {
    const query = { uid: data.uid };
    const update = { $set: data };
    const options = { upsert: true, new: true };
    const result = await this.backtestModel.findOneAndUpdate(
      query,
      update,
      options,
    );
    return result;
  }

  async findByUserId(
    userId: string,
    limit: number = 50,
  ): Promise<BacktestDocument[]> {
    const query = { userId: userId };
    const result = await this.backtestModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    return result;
  }

  async findById(backtestId: string): Promise<BacktestDocument> {
    const result = await this.backtestModel.findById(backtestId);
    return result;
  }

  async deleteById(backtestId: string): Promise<boolean> {
    const result = await this.backtestModel.findByIdAndDelete(backtestId);
    return !!result;
  }

  /**
   * Find optimization result from optimization_results collection
   * (Created by analytics server)
   */
  async findOptimizationResult(optimizationId: string): Promise<any> {
    try {
      // Access the optimization_results collection directly
      const collection = this.backtestModel.db.collection(
        'optimization_results',
      );
      const result = await collection.findOne({ optimizationId });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch optimization result: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Find walk-forward analysis result from walkforward_results collection
   * (Created by analytics server)
   */
  async findWalkForwardResult(analysisId: string): Promise<any> {
    try {
      // Access the walkforward_results collection directly
      const collection = this.backtestModel.db.collection(
        'walkforward_results',
      );
      const result = await collection.findOne({ analysisId });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch walk-forward result: ${error.message}`,
      );
      return null;
    }
  }
}
