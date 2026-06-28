import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Worker } from 'src/modules/worker/worker.entity';

import { WorkerController } from './worker.controller';
import { WorkerService } from './workers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Worker])],
  controllers: [WorkerController],
  providers: [WorkerService],
  exports: [WorkerService, TypeOrmModule],
})
export class WorkerModule {}
