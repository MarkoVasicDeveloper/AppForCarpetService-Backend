import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncomeCategory } from './entities/income-category.entity';
import { IncomeEntry } from './entities/income-entry.entity';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeCategory, IncomeEntry])],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService],
})
export class IncomeModule {}
