import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subscriber } from './subscriber.entity';
import { SubscribersController } from './subscribers.controller';
import { SubscibersService } from './subscribers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber])],
  controllers: [SubscribersController],
  providers: [SubscibersService],
  exports: [SubscibersService, TypeOrmModule],
})
export class SubscribersModule {}
