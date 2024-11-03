import { Test, TestingModule } from "@nestjs/testing";
import { AlgoService } from "../algo.service";
import { AlgoController } from "../algo.controller";
import { RedisService } from "src/redis/cache/redis.service";
import { BacktestService } from "src/database/service/backtest.service";
import { INestApplication } from "@nestjs/common";
import { validBacktestBody, invalidBacktestBody } from "./stub/backtest.stub";
import * as request from "supertest";
import { AlgoExceptionCode } from "../algo.exception";

describe('Algo Controller', () => {
    let app: INestApplication;
    let algoService: AlgoService;
    let algoController: AlgoController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AlgoController]
        }).compile();
        
        app = module.createNestApplication();
        await app.init();
        algoService = module.get<AlgoService>(AlgoService);
        algoController = module.get<AlgoController>(AlgoController);
    })

    afterAll(async () => {
        await app.close();
    });

    it("should return 201", async () => {
        const response = await request(app.getHttpServer())
            .post("/api/algo/backtest")
            .send(validBacktestBody)

        expect(response.status).toBe(201);
    })

    it("should return 400 with error code 2001", async () => {
        const response = await request(app.getHttpServer())
            .post("/api/algo/backtest")
            .send(invalidBacktestBody)
            .expect(400)

        expect(response.status).toBe(400);
        expect(response.body.errorCode).toBe(AlgoExceptionCode.INVALID_INTPUT_PARAMETER);
    })
})