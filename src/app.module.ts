import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AlgoModule } from './algo/algo.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envValidation from './config/config.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import * as dotenv from 'dotenv';
// import { RedisModule } from './redis/redis.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { WebsocketModule } from './websocket/websocket.module';
import { RedisModule } from './redis/redis.module';
import { OptimizerModule } from './optimizer/optimizer.module';
import { AlertsModule } from './alerts/alerts.module';
import { MarketModule } from './market/market.module';
import configuration from './config'
import { LoggerMiddleware } from './middleware';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
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
      load: configuration
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('db');
        // Always use authentication if credentials are provided
        const hasCredentials = dbConfig.username && dbConfig.password;
        const uri = hasCredentials
          ? `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}?authSource=admin`
          : `mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`;
        logger.debug('MongoDB URI: ' + uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs
        return { uri };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
				name: 'short',
				ttl: 1000,
				limit: 3,
			},
			{
				name: 'medium',
				ttl: 10000,
				limit: 20,
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
    AlgoModule,
    OptimizerModule,
    AlertsModule,
    MarketModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
