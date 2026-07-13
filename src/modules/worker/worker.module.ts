import { Module, ClassProvider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTH_PROVIDER_TOKEN } from 'src/modules/auth/types/authenticatable.interface';

import { WorkerController } from './worker.controller';
import { Worker } from './worker.entity';
import { WorkerService } from './worker.service';

@Module({
  imports: [TypeOrmModule.forFeature([Worker])],
  controllers: [WorkerController],
  providers: [
    WorkerService,
    {
      provide: AUTH_PROVIDER_TOKEN,
      useExisting: WorkerService,
      multi: true,
    } as unknown as ClassProvider,
  ],
  exports: [WorkerService, AUTH_PROVIDER_TOKEN],
})
export class WorkerModule {}
