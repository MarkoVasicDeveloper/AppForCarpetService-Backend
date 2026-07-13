import { Module, ClassProvider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTH_PROVIDER_TOKEN } from 'src/modules/auth/types/authenticatable.interface';

import { AdministratorController } from './administrator.controller';
import { Administrator } from './administrator.entity';
import { AdministratorService } from './administrator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Administrator])],
  controllers: [AdministratorController],
  providers: [
    AdministratorService,
    {
      provide: AUTH_PROVIDER_TOKEN,
      useExisting: AdministratorService,
      multi: true,
    } as unknown as ClassProvider,
  ],
  exports: [AdministratorService, AUTH_PROVIDER_TOKEN],
})
export class AdministratorModule {}
