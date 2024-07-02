import { Module } from '@nestjs/common';
import { AlgoModule } from './algo/algo.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import envValidation from './config/config.validation';

const validationSchema = envValidation();

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema,
      envFilePath: '.env',
      cache: true,
      isGlobal: true,
      load: [config],
    }),
    AlgoModule,
    UserModule,
  ],
})
export class AppModule {}
