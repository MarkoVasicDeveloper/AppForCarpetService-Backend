import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscribersController } from './subscribers.controller';
import { Subscribers } from './subscribers.entity';
import { SubscibersService } from './subscribers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscribers])],
  controllers: [SubscribersController],
  providers: [SubscibersService],
  exports: [SubscibersService, TypeOrmModule],
})
export class SubscribersModule {}
