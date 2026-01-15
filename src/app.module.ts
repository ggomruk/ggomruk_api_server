import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './domain/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envValidation from './config/config.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import * as dotenv from 'dotenv';
import { WebsocketModule } from './domain/websocket/websocket.module';
import { RedisModule } from './domain/redis/redis.module';
import { OptimizerModule } from './domain/algo/optimizer/optimizer.module';
import { BacktestModule } from './domain/algo/backtest/backtest.module';
import { AlertsModule } from './domain/alerts/alerts.module';
import { MarketModule } from './domain/market/market.module';
import { OnchainModule } from './domain/onchain/onchain.module';
import configuration from './config';
import { LoggerMiddleware } from './common/middleware';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './domain/auth/guards/jwt-auth.guard';
import { IDbConfig } from './config/db.config';
import { IAppConfig } from './config/app.config';
import { HealthController } from './common/health/health.controller';
dotenv.config();

const envValidationSchema = envValidation();
const logger = new Logger('App Module');

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: envValidationSchema,
      envFilePath: '.env',
      cache: true,
      isGlobal: true,
      load: configuration,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const appConfig = configService.get<IAppConfig>('app');
        const dbConfig = configService.get<IDbConfig>('db');
        // Always use authentication if credentials are provided
        const env = appConfig.env;
        if (env === 'prod') {
          const uri = dbConfig.uri;
          logger.debug('MongoDB URI: ' + uri.replace(/:([^:@]+)@/, ':****@'));
          return { uri };
        } else {
          const hasCredentials = dbConfig.username && dbConfig.password;
          const uri = hasCredentials
            ? `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}?authSource=admin`
            : `mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`;
          logger.debug('MongoDB URI: ' + uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs
          return { uri };
        }
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10,  // Increased from 3 to 10
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 40,  // Increased from 20 to 40
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    RedisModule,
    WebsocketModule,
    AuthModule,
    BacktestModule,
    OptimizerModule,
    AlertsModule,
    MarketModule,
    OnchainModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
