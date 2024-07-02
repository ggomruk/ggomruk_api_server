import { Logger, Module } from '@nestjs/common';
import { AlgoModule } from './algo/algo.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import envValidation from './config/config.validation';
import { MongooseModule } from '@nestjs/mongoose';

const validationSchema = envValidation();
const logger = new Logger('App Module');

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema,
      envFilePath: '.env',
      cache: true,
      isGlobal: true,
      load: [config],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get(`database.${process.env.NODE_ENV}`);
        const uri =
          process.env.NODE_ENV === 'prod'
            ? `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`
            : `mongodb://localhost:27017`;
        logger.debug('MongoDB URI: ' + uri);
        return { uri };
      },
      inject: [ConfigService],
    }),
    AlgoModule,
    UserModule,
  ],
})
export class AppModule {}
