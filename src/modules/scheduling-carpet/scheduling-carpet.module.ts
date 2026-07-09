import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingCarpet } from 'src/modules/scheduling-carpet/scheduling-carpet.entity';

import { SchedulingCarpetController } from './scheduling-carpet.controller';
import { SchedulingCarpetService } from './scheduling-carpet.service';
@Module({
  imports: [TypeOrmModule.forFeature([SchedulingCarpet])],
  controllers: [SchedulingCarpetController],
  providers: [SchedulingCarpetService],
  exports: [SchedulingCarpetService],
})
export class SchedulingCarpetModule {}
