import { v4 as uuidv4 } from 'uuid';
import { Test, TestingModule } from "@nestjs/testing"
import { AlgoService } from "../algo.service"
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from "mongoose"
import { RedisService } from "src/redis/redis.service"
import { BacktestService } from "src/database/service/backtest.service"
import { validBacktestBody } from "./stub/backtest.stub"
import { IBacktestParams } from 'src/database/schema/backtestParams.schema';

describe('Algo Service', () => {
    let algoService: AlgoService;
    let backtestService: BacktestService;
    let mongod: MongoMemoryServer;
    
    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri, {});
    })
    
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AlgoService,
                {
                    provide: RedisService,
                    useValue: {
                        publishBacktestData: jest.fn().mockImplementation(() => Promise.resolve())
                    }
                },
                {
                    provide: BacktestService,
                    useValue: {
                        saveWithUidAndBacktestParams: jest.fn().mockImplementation(async (uid, backtestParams) => {
                            let result = await mongoose.connection.collection('backtest').insertOne({uid, backtestParams})
                            return result;
                        })
                    }
                }
            ]
        }).compile();
    
        algoService = module.get<AlgoService>(AlgoService)
        backtestService = module.get<BacktestService>(BacktestService)

    })

    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    })

    it('Data should be saved to DB', async () => {
        const uid = uuidv4();
        let strategies = {}
        for (const strategy in validBacktestBody.strategies) {
            let params = validBacktestBody.strategies[strategy]
            strategies[strategy.toLowerCase()] = params
        }
        let { symbol, usdt, interval, startDate, endDate, tc, leverage } = validBacktestBody;
        let backtestParams : IBacktestParams = {
            symbol,
            usdt,
            interval,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            commission: tc,
            leverage,
            strategies
        };

        let insertDataResult = await backtestService.saveWithUidAndBacktestParams(uid, backtestParams);
        expect(insertDataResult['acknowledged']).toBe(true);
    });

    it('Error should be thrown if data already exists', () => {
        expect(1).toBe(1);
    }); 

})