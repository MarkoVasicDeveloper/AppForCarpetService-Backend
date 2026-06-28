import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cost } from 'src/modules/cost/cost.entity';

import { CostController } from './cost.controller';
import { CostService } from './cost.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cost])],
  controllers: [CostController],
  providers: [CostService],
  exports: [CostService, TypeOrmModule],
})
export class CostModule {}
