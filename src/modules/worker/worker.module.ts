import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { WorkerController } from './worker.controller';
import { Worker } from './worker.entity';
import { WorkerService } from './worker.service';

@Module({
  imports: [TypeOrmModule.forFeature([Worker]), forwardRef(() => AuthModule)],
  controllers: [WorkerController],
  providers: [WorkerService],
  exports: [WorkerService],
})
export class WorkerModule {}
