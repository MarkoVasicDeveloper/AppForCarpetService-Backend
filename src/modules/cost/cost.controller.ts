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

import { CostService } from './cost.service';
import { AddCostCategoryDto } from './dto/add-cost-category.dto';
import { AddCostEntryDto } from './dto/add-cost-entry.dto';
import { EditCostCategoryDto } from './dto/edit-cost-category.dto';
import { EditCostEntryDto } from './dto/edit-cost-entry.dto';
import { CostCategory } from './entities/cost-category.entity';
import { CostEntry } from './entities/cost-entry.entity';

@Controller('costs')
@UseGuards(RoleCheckerGuard)
@Roles(Role.ADMINISTRATOR, Role.USER)
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Post('categories')
  async addCategory(
    @CurrentOwnerId() userId: number,
    @Body() data: AddCostCategoryDto,
  ): Promise<CostCategory> {
    return await this.costService.addCategory(data, userId);
  }

  @Patch('categories/:id')
  async editCategory(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: EditCostCategoryDto,
  ): Promise<CostCategory> {
    return await this.costService.editCategory(id, userId, data);
  }

  @Get('categories')
  async getAllCategories(@CurrentOwnerId() userId: number): Promise<CostCategory[]> {
    return await this.costService.getAllCategories(userId);
  }

  @Post('entries')
  async addEntry(
    @CurrentOwnerId() userId: number,
    @Body() data: AddCostEntryDto,
  ): Promise<CostEntry> {
    return await this.costService.addEntry(data, userId);
  }

  @Patch('entries/:id')
  async editEntry(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: EditCostEntryDto,
  ): Promise<CostEntry> {
    return await this.costService.editEntry(id, userId, data);
  }

  @Get('entries/category/:costsId')
  async getAllEntries(
    @CurrentOwnerId() userId: number,
    @Param('costsId', ParseIntPipe) costsId: number,
  ): Promise<CostEntry[]> {
    return await this.costService.getAllEntries(costsId, userId);
  }

  @Get('entries/category/:costsId/supplier/:supplierId')
  async getAllEntriesBySupplier(
    @CurrentOwnerId() userId: number,
    @Param('costsId', ParseIntPipe) costsId: number,
    @Param('supplierId', ParseIntPipe) supplierId: number,
  ): Promise<CostEntry[]> {
    return await this.costService.getAllEntriesBySupplier(costsId, supplierId, userId);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.costService.deleteCategory(id, userId);
  }

  @Delete('entries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEntry(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.costService.deleteEntry(id, userId);
  }
}
