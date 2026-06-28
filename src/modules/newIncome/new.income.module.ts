import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddNewIncome } from 'src/modules/newIncome/add.new.income.entity';

import { AddNewIncomeController } from './add.new.income.controller';
import { AddNewIncomeService } from './add.new.income.service';

@Module({
  imports: [TypeOrmModule.forFeature([AddNewIncome])],
  controllers: [AddNewIncomeController],
  providers: [AddNewIncomeService],
  exports: [AddNewIncomeService, TypeOrmModule],
})
export class NewIncomeModule {}
