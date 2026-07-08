import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CarpetModule } from '../carpet/carpet.module';
import { ClientsModule } from '../clients/clients.module';

import { CarpetReceptionController } from './carpet-reception.controller';
import { CarpetReception } from './carpet-reception.entity';
import { CarpetReceptionsService } from './carpet-reception.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarpetReception]), CarpetModule, ClientsModule],
  controllers: [CarpetReceptionController],
  providers: [CarpetReceptionsService],
  exports: [CarpetReceptionsService],
})
export class CarpetReceptionModule {}
