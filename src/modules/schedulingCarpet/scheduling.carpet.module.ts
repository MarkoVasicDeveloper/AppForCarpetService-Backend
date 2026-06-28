import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingCarpet } from 'src/modules/schedulingCarpet/scheduling.carpet.entity';

import SchedulingCarpetController from './scheduling.carpet.controller';
import SchedulingCarpetService from './scheduling.carpet.service';

@Module({
  imports: [TypeOrmModule.forFeature([SchedulingCarpet])],
  controllers: [SchedulingCarpetController],
  providers: [SchedulingCarpetService],
  exports: [SchedulingCarpetService, TypeOrmModule],
})
export class SchedulingCarpetModule {}
