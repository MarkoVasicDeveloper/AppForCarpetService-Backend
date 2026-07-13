import { Module, ClassProvider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTH_PROVIDER_TOKEN } from 'src/modules/auth/types/authenticatable.interface';

import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: AUTH_PROVIDER_TOKEN,
      useExisting: UserService,
      multi: true,
    } as unknown as ClassProvider,
  ],
  exports: [UserService, AUTH_PROVIDER_TOKEN],
})
export class UserModule {}
