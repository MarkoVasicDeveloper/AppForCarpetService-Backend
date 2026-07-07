import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdministratorModule } from '../administrator/administrator.module';
import { UserModule } from '../user/user.module';
import { WorkerModule } from '../worker/worker.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshAdministratorToken } from './entities/refresh-administrator-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshWorkerToken } from './entities/refresh-worker-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

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
    forwardRef(() => AdministratorModule),
    forwardRef(() => WorkerModule),
    UserModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
