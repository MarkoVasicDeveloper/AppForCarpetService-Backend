import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CarpetController } from '../carpet/carpet.controller';
import { Carpet } from '../carpet/carpet.entity';
import { CarpetService } from '../carpet/carpet.service';
import { ClientsModule } from '../clients/clients.module';

import { CarpetReceptionController } from './carpet-reception.controller';
import { CarpetReception } from './carpet-reception.entity';
import { CarpetReceptionsService } from './carpet-reception.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarpetReception, Carpet]), ClientsModule],
  controllers: [CarpetController, CarpetReceptionController],
  providers: [CarpetService, CarpetReceptionsService],
  exports: [CarpetService, CarpetReceptionsService, TypeOrmModule],
})
export class CarpetReceptionModule {}
