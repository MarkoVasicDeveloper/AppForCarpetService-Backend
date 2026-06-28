import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscribers } from 'entities/Subscribers';

import { SubscribersController } from './subscribers.controller';
import { SubscibersService } from './subscribers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscribers])],
  controllers: [SubscribersController],
  providers: [SubscibersService],
  exports: [SubscibersService, TypeOrmModule],
})
export class SubscibresModule {}
