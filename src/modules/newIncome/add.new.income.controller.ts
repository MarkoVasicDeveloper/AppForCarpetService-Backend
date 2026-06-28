import { Controller, Post, UseGuards, SetMetadata, Param, Get, Body } from '@nestjs/common';
import { AddNewIncomeDto } from 'src/modules/newIncome/DTO/add.new.income.dto';
import { EditNewIncomeDto } from 'src/modules/newIncome/DTO/edit.new.income.dto';
import { AddNewIncome } from 'src/modules/newIncome/add.new.income.entity';
import { ApiResponse } from 'src/misc/api.restonse';
import { AddNewIncomeService } from 'src/modules/newIncome/add.new.income.service';
import { RolleCheckerGard } from 'src/rollecheckergard/rolle.checker.gatd';

@Controller('api/newIncome')
export class AddNewIncomeController {
  constructor(private readonly addNewIncomeService: AddNewIncomeService) {}

  @Post('add')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async addNewIncome(@Body() data: AddNewIncomeDto): Promise<AddNewIncome | ApiResponse> {
    return await this.addNewIncomeService.addNewIncome(data);
  }

  @Post('edit')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async editNewIncome(@Body() data: EditNewIncomeDto): Promise<AddNewIncome | ApiResponse> {
    return await this.addNewIncomeService.editNewIncome(data);
  }

  @Get(':userId/:incomeId')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async getAllNewIncome(
    @Param('userId') userId: number,
    @Param('incomeId') incomeId: number,
  ): Promise<AddNewIncome[]> {
    return await this.addNewIncomeService.getAllNewIncomeFromIncome(userId, incomeId);
  }
}
