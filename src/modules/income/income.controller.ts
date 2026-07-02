import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';
import { ApiResponse } from 'src/shared/response/api-response';

import { AddIncomeCategoryDto } from './dto/add-income-category.dto';
import { AddIncomeEntryDto } from './dto/add-income-entry.dto';
import { EditIncomeCategoryDto } from './dto/edit-income-category.dto';
import { EditIncomeEntryDto } from './dto/edit-income-entry.dto';
import { IncomeCategory } from './entities/income-category.entity';
import { IncomeEntry } from './entities/income-entry.entity';
import { IncomeService } from './income.service';

@Controller('api/income')
@UseGuards(RoleCheckerGuard)
@SetMetadata('allow_to_roles', ['user', 'administrator'])
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post('category/add/:userId')
  async addCategory(
    @Body() data: AddIncomeCategoryDto,
    @Param('userId') userId: number,
  ): Promise<IncomeCategory | ApiResponse> {
    return await this.incomeService.addCategory(data, userId);
  }

  @Post('category/edit/:userId')
  async editCategory(
    @Body() data: EditIncomeCategoryDto,
    @Param('userId') userId: number,
  ): Promise<IncomeCategory | ApiResponse> {
    return await this.incomeService.editCategory(data, userId);
  }

  @Get('category/all/:userId')
  async getAllCategories(@Param('userId') userId: number): Promise<IncomeCategory[]> {
    return await this.incomeService.getAllCategories(userId);
  }

  @Post('entry/add')
  async addEntry(@Body() data: AddIncomeEntryDto): Promise<IncomeEntry | ApiResponse> {
    return await this.incomeService.addEntry(data);
  }

  @Post('entry/edit')
  async editEntry(@Body() data: EditIncomeEntryDto): Promise<IncomeEntry | ApiResponse> {
    return await this.incomeService.editEntry(data);
  }

  @Get('entry/all/:userId/:incomeId')
  async getAllEntries(
    @Param('userId') userId: number,
    @Param('incomeId') incomeId: number,
  ): Promise<IncomeEntry[]> {
    return await this.incomeService.getAllEntriesFromCategory(userId, incomeId);
  }
}
