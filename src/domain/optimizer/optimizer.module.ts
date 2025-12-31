import { Module } from '@nestjs/common';
import { OptimizerController } from './optimizer.controller';
import { OptimizerService } from './optimizer.service';
import { DatabaseModule } from 'src/common/database/database.module';
import { RedisModule } from 'src/domain/redis/redis.module';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [OptimizerController],
  providers: [OptimizerService],
  exports: [OptimizerService],
})
export class OptimizerModule {}
