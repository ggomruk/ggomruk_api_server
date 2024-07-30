import { Injectable, Logger } from "@nestjs/common";
import { BacktestSchemaRepository } from "../repository/backtest.repository";
import { BacktestDocument } from "../schema";
import { BacktestDTO } from "src/algo/dto/backtest.dto";


export interface IBacktestService {
    findByUid(uid: string): Promise<BacktestDocument|null>;
    findByUidAndCheckResult(uid: string): Promise<BacktestDocument|null>;
    saveWithUidAndBacktestParams(uid: string, params: BacktestDTO): Promise<BacktestDocument>;
}


@Injectable()
export class BacktestService implements IBacktestService {
    private readonly logger = new Logger(BacktestService.name);

    constructor(
        private readonly backtestRepository: BacktestSchemaRepository
    ) {}
    
    async findByUid(uid: string):Promise<BacktestDocument|null>{
        return null;
    }
    
    async findByUidAndCheckResult(uid: string): Promise<BacktestDocument|null> {
        return null;
    }
    
    saveWithUidAndBacktestParams(uid: string, params: BacktestDTO): Promise<BacktestDocument> {
        throw new Error("Method not implemented.");
    }
}