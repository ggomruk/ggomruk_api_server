import { Logger, Module } from '@nestjs/common';
import { AlgoModule } from './algo/algo.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import devConfig from './config/dev.config';
import prodConfig from './config/prod.config';
import envValidation from './config/config.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import * as dotenv from 'dotenv';
// import { RedisModule } from './redis/redis.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { WebsocketModule } from './websocket/websocket.module';
import { RedisModule } from './redis/redis.module';
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
      load: [process.env.NODE_ENV === 'prod' ? prodConfig : devConfig],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
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
        ttl: 60 * 1000, // duration of counter. counter resets after 1 minute
        limit: 10, // maximum number of requests a source is allowed to make within the specific ttl. further requests are blocked if limit is reached
      },
    ]),
    RedisModule,
    // UserModule,
    AlgoModule,
    // WebsocketModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => {
    //     const wsConfig = configService.get('websocket');
    //     return wsConfig;
    //   },
    //   inject: [ConfigService],
    // })
  ],
})
export class AppModule {}
