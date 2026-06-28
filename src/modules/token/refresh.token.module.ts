import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'entities/RefreshToken';

import { RefreshTokenController } from './refresh.token.controller';
import { RefreshTokenService } from './refresh.token.service';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken])],
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService, TypeOrmModule],
})
export class RefreshTokenModule {}
