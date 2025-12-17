import { Injectable, Logger } from "@nestjs/common";
import { BacktestSchemaRepository } from "../repository/backtest.repository";
import { BacktestDocument } from "../schema";
import { BacktestDTO } from "src/algo/dto/backtest.dto";
import { IBacktestParams } from "../schema/backtestParams.schema";
import { AlgoException, AlgoExceptionCode } from "src/algo/algo.exception";

export interface IBacktestService {
    findByUid(uid: string): Promise<BacktestDocument|null>;
    findByUidAndCheckResult(uid: string): Promise<BacktestDocument|null>;
    saveWithUidAndBacktestParams(uid: string, params: IBacktestParams): Promise<BacktestDocument>;
    checkAndUpdateResultIfUidExists(uid: string, result: any): Promise<BacktestDocument>;
    getUserBacktests(userId: string, limit?: number): Promise<BacktestDocument[]>;
    getBacktestById(backtestId: string): Promise<BacktestDocument|null>;
    deleteBacktest(backtestId: string): Promise<boolean>;
}

@Injectable()
export class BacktestService implements IBacktestService {
    private readonly logger = new Logger(BacktestService.name);

    constructor(
        private readonly backtestRepository: BacktestSchemaRepository
    ) {}
    
    async findByUid(uid: string):Promise<BacktestDocument|null>{
        let document = this.backtestRepository.findByUid(uid);
        return document;
    }
    
    async findByUidAndCheckResult(uid: string): Promise<BacktestDocument|null> {
        return null;
    }
    
    async saveWithUidAndBacktestParams(uid: string, params: IBacktestParams): Promise<BacktestDocument> {
        let result = await this.backtestRepository.insertData({uid, backtestParams: params});
        return result;
    }

    async checkAndUpdateResultIfUidExists(uid: string, result: any): Promise<BacktestDocument> {
        let document = await this.backtestRepository.findByUid(uid);
        if (!document) {
            // Record not found
            throw new AlgoException(AlgoExceptionCode.BACKTEST_NOT_FOUND, `Backtest with uid ${uid} not found`);
        } else if (!document.result) {
            // Record found but result not found, update the result field
            document.result = result;
            let updatedDocument = await this.backtestRepository.upsertData(document);
            return updatedDocument;
        } else {
            // Record found and result already exists
            throw new AlgoException(AlgoExceptionCode.BACKTEST_RESULT_ALREADY_EXISTS, `Backtest with uid ${uid} already has a result`);
        }
    }

    async getUserBacktests(userId: string, limit: number = 50): Promise<BacktestDocument[]> {
        return await this.backtestRepository.findByUserId(userId, limit);
    }

    async getBacktestById(backtestId: string): Promise<BacktestDocument|null> {
        return await this.backtestRepository.findById(backtestId);
    }

    async deleteBacktest(backtestId: string): Promise<boolean> {
        return await this.backtestRepository.deleteById(backtestId);
    }

    /**
     * Get optimization result from MongoDB (saved by analytics server)
     */
    async getOptimizationResult(optimizationId: string): Promise<any> {
        try {
            const result = await this.backtestRepository.findOptimizationResult(optimizationId);
            return result;
        } catch (error) {
            this.logger.error(`Failed to fetch optimization result: ${error.message}`);
            return null;
        }
    }

    /**
     * Get walk-forward analysis result from MongoDB (saved by analytics server)
     */
    async getWalkForwardResult(analysisId: string): Promise<any> {
        try {
            const result = await this.backtestRepository.findWalkForwardResult(analysisId);
            return result;
        } catch (error) {
            this.logger.error(`Failed to fetch walk-forward result: ${error.message}`);
            return null;
        }
    }
}