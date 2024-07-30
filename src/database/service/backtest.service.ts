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
    
    async saveWithUidAndBacktestParams(uid: string, params: IBacktestParams): Promise<BacktestDocument|null> {
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
}