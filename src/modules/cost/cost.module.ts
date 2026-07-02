import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CostController } from './cost.controller';
import { CostService } from './cost.service';
import { CostCategory } from './entities/cost-category.entity';
import { CostEntry } from './entities/cost-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CostCategory, CostEntry])],
  controllers: [CostController],
  providers: [CostService],
  exports: [CostService],
})
export class CostModule {}
