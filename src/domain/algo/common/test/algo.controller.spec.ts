import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { validBacktestBody, invalidBacktestBody } from "./stub/backtest.stub";
import request = require("supertest");
import { AlgoController } from "../../algo.controller";
import { AlgoExceptionCode } from "../../algo.exception";
import { AlgoService } from "../../algo.service";

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