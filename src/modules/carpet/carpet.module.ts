import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carpet } from 'src/modules/carpet/carpet.entity';

import { CarpetController } from './carpet.controller';
import { CarpetService } from './carpet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Carpet])],
  controllers: [CarpetController],
  providers: [CarpetService],
  exports: [CarpetService, TypeOrmModule],
})
export class CarpetModule {}
