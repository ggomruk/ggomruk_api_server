import { Logger, Module } from '@nestjs/common';
import { AlgoModule } from './algo/algo.module';
import { UserModule } from './user/user.module';
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
import configuration from './config'
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
        const uri =
          process.env.NODE_ENV === 'prod'
            ? `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`
            : `mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`;
        logger.debug('MongoDB URI: ' + uri);
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
    UserModule,
    AuthModule,
    AlgoModule,
  ],
})
export class AppModule {}
