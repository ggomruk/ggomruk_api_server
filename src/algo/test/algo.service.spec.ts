import { v4 as uuidv4 } from 'uuid';
import { Test, TestingModule } from "@nestjs/testing"
import { AlgoService } from "../algo.service"
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from "mongoose"
import { BacktestService } from "src/database/service/backtest.service"
import { validBacktestBody } from "./stub/backtest.stub"
import { IBacktestParams } from 'src/database/schema/backtestParams.schema';
import { E_Task } from '../enum/task';
import Redis from 'ioredis-mock';
import { RedisService } from 'src/redis/redis.service';

describe('Algo Service', () => {
    let algoService: AlgoService;
    let backtestService: BacktestService;
    let mongod: MongoMemoryServer;
    let redisClient;
    
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
                    useValue: new Redis()
                },
                {
                    provide: BacktestService,
                    useValue: {
                        saveWithUidAndBacktestParams: jest.fn().mockImplementation(async (uid, backtestParams) => {
                            const collection = mongoose.connection.collection('backtest');
                            
                            let existing = await collection.findOne({uid});
                            if (existing) {
                                throw new Error('Data already exists');
                            }
                            let result = await collection.insertOne({uid, backtestParams})
                            return result;
                        })
                    }
                }
            ]
        }).compile();
    
        algoService = module.get<AlgoService>(AlgoService)
        backtestService = module.get<BacktestService>(BacktestService)
        redisClient = module.get(RedisService)

        console.log(redisClient)

    })

    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
        redisClient.flushall();
        redisClient.quit();
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

    it('Error should be thrown if data already exists', async () => {
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

        await backtestService.saveWithUidAndBacktestParams(uid, backtestParams);
        try {
            let result = await backtestService.saveWithUidAndBacktestParams(uid, backtestParams);
        } catch (e) {
            expect(e.message).toBe('Data already exists');
        }
    });

    it("Data should be published to redis", async () => {
        let uid = uuidv4();
        let task = E_Task.BACKTEST;
        let data = {}

        let metadata = { timestamp: new Date().toISOString() };
        data = { ...data, ...metadata };

        let result = await redisClient.publish(task, JSON.stringify({ task, uid, data }));
        expect(result).toBe(0);
    });


})