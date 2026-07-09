import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentOwnerId } from 'src/shared/decorators/current-owner-id.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { AddIncomeCategoryDto } from './dto/add-income-category.dto';
import { AddIncomeEntryDto } from './dto/add-income-entry.dto';
import { EditIncomeCategoryDto } from './dto/edit-income-category.dto';
import { EditIncomeEntryDto } from './dto/edit-income-entry.dto';
import { IncomeCategory } from './entities/income-category.entity';
import { IncomeEntry } from './entities/income-entry.entity';
import { IncomeService } from './income.service';

@Controller('incomes')
@UseGuards(RoleCheckerGuard)
@Roles(Role.ADMINISTRATOR, Role.USER)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post('categories')
  async addCategory(
    @CurrentOwnerId() userId: number,
    @Body() data: AddIncomeCategoryDto,
  ): Promise<IncomeCategory> {
    return await this.incomeService.addCategory(data, userId);
  }

  @Get('categories')
  async getAllCategories(@CurrentOwnerId() userId: number): Promise<IncomeCategory[]> {
    return await this.incomeService.getAllCategories(userId);
  }

  @Get('categories/:id')
  async getCategory(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IncomeCategory> {
    return await this.incomeService.getCategoryById(id, userId);
  }

  @Patch('categories/:id')
  async editCategory(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: EditIncomeCategoryDto,
  ): Promise<IncomeCategory> {
    return await this.incomeService.editCategory(id, userId, data);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.incomeService.deleteCategory(id, userId);
  }

  @Post('entries')
  async addEntry(
    @CurrentOwnerId() userId: number,
    @Body() data: AddIncomeEntryDto,
  ): Promise<IncomeEntry> {
    return await this.incomeService.addEntry(data, userId);
  }

  @Get('categories/:categoryId/entries')
  async getAllEntries(
    @CurrentOwnerId() userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<IncomeEntry[]> {
    return await this.incomeService.getAllEntriesFromCategory(categoryId, userId);
  }

  @Get('entries/:id')
  async getEntry(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IncomeEntry> {
    return await this.incomeService.getEntryById(id, userId);
  }

  @Patch('entries/:id')
  async editEntry(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: EditIncomeEntryDto,
  ): Promise<IncomeEntry> {
    return await this.incomeService.editEntry(id, userId, data);
  }

  @Delete('entries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEntry(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.incomeService.deleteEntry(id, userId);
  }
}
