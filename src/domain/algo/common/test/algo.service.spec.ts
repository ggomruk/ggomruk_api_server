import { v4 as uuidv4 } from 'uuid';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { BacktestService } from '../../backtest/backtest.service';
import { validBacktestBody } from './stub/backtest.stub';
import { IBacktestParams } from '../../backtest/schemas/backtestParams.schema';
import { E_Task } from '../enum/task';
import Redis from 'ioredis-mock';
import { AlgoService } from '../../algo.service';
import RedisMessageQueueClient from 'src/domain/redis/messageQueue/redis.mq.client';
import { OptimizationTaskService } from '../../optimizer/service/optimizationTask.service';
import { OptimizationResultService } from '../../optimizer/service/optimizationResult.service';
import { BacktestPubSubService } from 'src/domain/redis/messageQueue/backtest-pubsub.service';
import { WebsocketGateway } from 'src/domain/websocket/websocketGateway';

describe('Algo Service', () => {
  let algoService: AlgoService;
  let backtestService: BacktestService;
  let mongod: MongoMemoryServer;
  let redisClient;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {});
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlgoService,
        {
          provide: RedisMessageQueueClient,
          useValue: new Redis(),
        },
        {
          provide: OptimizationTaskService,
          useValue: {
            createTask: jest.fn(),
          },
        },
        {
          provide: OptimizationResultService,
          useValue: {
            saveResult: jest.fn(),
          },
        },
        {
          provide: BacktestPubSubService,
          useValue: {
            onOptimizationComplete: jest.fn(),
            publishBacktestRequest: jest.fn(),
            publishTask: jest.fn(),
          },
        },
        {
          provide: WebsocketGateway,
          useValue: {
            server: {
              emit: jest.fn(),
            },
            emitBacktestStarted: jest.fn(),
          },
        },
        {
          provide: BacktestService,
          useValue: {
            saveWithUidAndBacktestParams: jest
              .fn()
              .mockImplementation(async (uid, backtestParams) => {
                const collection = mongoose.connection.collection('backtest');

                let existing = await collection.findOne({ uid });
                if (existing) {
                  throw new Error('Data already exists');
                }
                let result = await collection.insertOne({
                  uid,
                  backtestParams,
                });
                return result;
              }),
          },
        },
      ],
    }).compile();

    algoService = module.get<AlgoService>(AlgoService);
    backtestService = module.get<BacktestService>(BacktestService);
    redisClient = module.get(RedisMessageQueueClient);
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    if (redisClient && typeof redisClient.flushall === 'function') {
      redisClient.flushall();
    }
    if (redisClient && typeof redisClient.quit === 'function') {
      redisClient.quit();
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('Data should be saved to DB', async () => {
    const uid = uuidv4();
    let strategies = {};
    for (const strategy in validBacktestBody.strategies) {
      let params = validBacktestBody.strategies[strategy];
      strategies[strategy.toLowerCase()] = params;
    }
    let { symbol, usdt, interval, startDate, endDate, tc, leverage } =
      validBacktestBody;
    let backtestParams: IBacktestParams = {
      symbol,
      usdt,
      interval,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      commission: tc,
      leverage,
      strategies,
    };

    let insertDataResult = await backtestService.saveWithUidAndBacktestParams(
      uid,
      backtestParams,
    );

    expect((insertDataResult as any).acknowledged).toBe(true);
  });

  it('Error should be thrown if data already exists', async () => {
    const uid = uuidv4();
    let strategies = {};
    for (const strategy in validBacktestBody.strategies) {
      let params = validBacktestBody.strategies[strategy];
      strategies[strategy.toLowerCase()] = params;
    }
    let { symbol, usdt, interval, startDate, endDate, tc, leverage } =
      validBacktestBody;
    let backtestParams: IBacktestParams = {
      symbol,
      usdt,
      interval,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      commission: tc,
      leverage,
      strategies,
    };

    await backtestService.saveWithUidAndBacktestParams(uid, backtestParams);

    await expect(
      backtestService.saveWithUidAndBacktestParams(uid, backtestParams),
    ).rejects.toThrow('Data already exists');
  });

  it('Data should be published to redis', async () => {
    // Mock toBacktestParams method on validBacktestBody
    const backtestDTO = {
      ...validBacktestBody,
      toBacktestParams: () => ({
        symbol: validBacktestBody.symbol,
        usdt: validBacktestBody.usdt,
        interval: validBacktestBody.interval,
        startDate: new Date(validBacktestBody.startDate),
        endDate: new Date(validBacktestBody.endDate),
        commission: validBacktestBody.tc,
        leverage: validBacktestBody.leverage,
        strategies: {},
      }),
    };

    await algoService.runBacktest(backtestDTO as any, 'test-user-id');
  });
});
