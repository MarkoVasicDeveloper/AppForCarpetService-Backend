import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Costs } from 'src/modules/costs/costs.entity';

import { CostsController } from './costs.controller';
import { CostsService } from './costs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Costs])],
  controllers: [CostsController],
  providers: [CostsService],
  exports: [CostsService, TypeOrmModule],
})
export class CostsModule {}
