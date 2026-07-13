import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdministratorModule } from '../administrator/administrator.module';
import { AdministratorService } from '../administrator/administrator.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { WorkerModule } from '../worker/worker.module';
import { WorkerService } from '../worker/worker.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshAdministratorToken } from './entities/refresh-administrator-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshWorkerToken } from './entities/refresh-worker-token.entity';
import { AuthEventListener } from './listeners/auth-event.listener';
import { RefreshTokenService } from './refresh-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AUTH_PROVIDER_TOKEN } from './types/authenticatable.interface';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'DEFAULT_SECRET_PRODUCTION',
      }),
    }),
    TypeOrmModule.forFeature([RefreshToken, RefreshAdministratorToken, RefreshWorkerToken]),
    ConfigModule,
    AdministratorModule,
    WorkerModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenService,
    AuthEventListener,
    {
      provide: AUTH_PROVIDER_TOKEN,
      useFactory: (user: UserService, admin: AdministratorService, worker: WorkerService) => {
        return [user, admin, worker];
      },
      inject: [UserService, AdministratorService, WorkerService],
    },
  ],
  exports: [AuthService, PassportModule, RefreshTokenService],
})
export class AuthModule {}
