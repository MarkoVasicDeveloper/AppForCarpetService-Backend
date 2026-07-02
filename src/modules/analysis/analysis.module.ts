import { Module } from '@nestjs/common';

import { CarpetModule } from '../carpet/carpet.module';
import { CarpetReceptionModule } from '../carpet-receptions/carpet-reception.module';
import { ClientsModule } from '../clients/clients.module';

import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [ClientsModule, CarpetModule, CarpetReceptionModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
