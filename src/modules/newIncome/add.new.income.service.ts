import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddNewIncomeDto } from 'src/modules/newIncome/DTO/add.new.income.dto';
import { EditNewIncomeDto } from 'src/modules/newIncome/DTO/edit.new.income.dto';
import { AddNewIncome } from 'src/modules/newIncome/add.new.income.entity';
import { ApiResponse } from 'src/misc/api.restonse';
import { Repository } from 'typeorm';

@Injectable()
export class AddNewIncomeService {
  constructor(
    @InjectRepository(AddNewIncome) private readonly addNewIncomeService: Repository<AddNewIncome>,
  ) {}
  async addNewIncome(data: AddNewIncomeDto): Promise<AddNewIncome | ApiResponse> {
    const newAddIncome = new AddNewIncome();
    newAddIncome.incomeId = data.incomeId;
    newAddIncome.value = data.value;
    newAddIncome.userId = data.userId;

    return await this.addNewIncomeService.save(newAddIncome);
  }

  async editNewIncome(data: EditNewIncomeDto): Promise<AddNewIncome | ApiResponse> {
    const newIncome = await this.addNewIncomeService.findOne({
      where: {
        userId: data.userId,
        incomeId: data.incomeId,
      },
    });

    if (!newIncome) return new ApiResponse('error', -12001, 'Not found');

    if (data.incomeId) newIncome.incomeId = data.incomeId;
    if (data.value) newIncome.value = data.value;

    return await this.addNewIncomeService.save(newIncome);
  }

  async getAllNewIncomeFromIncome(userId: number, incomeId: number): Promise<AddNewIncome[]> {
    return await this.addNewIncomeService.find({
      where: {
        userId: userId,
        incomeId: incomeId,
      },
    });
  }
}
