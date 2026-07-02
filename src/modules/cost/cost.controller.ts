import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';
import { ApiResponse } from 'src/shared/response/api-response';

import { CostService } from './cost.service';
import { AddCostCategoryDto } from './dto/add-cost-category.dto';
import { AddCostEntryDto } from './dto/add-cost-entry.dto';
import { EditCostCategoryDto } from './dto/edit-cost-category.dto';
import { EditCostEntryDto } from './dto/edit-cost-entry.dto';
import { CostCategory } from './entities/cost-category.entity';
import { CostEntry } from './entities/cost-entry.entity';

@Controller('api/cost')
@UseGuards(RoleCheckerGuard)
@SetMetadata('allow_to_roles', ['user', 'administrator'])
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Post('category/add/:userId')
  async addCategory(
    @Body() data: AddCostCategoryDto,
    @Param('userId') userId: number,
  ): Promise<CostCategory | ApiResponse> {
    return await this.costService.addCategory(data, userId);
  }

  @Post('category/edit/:userId')
  async editCategory(
    @Body() data: EditCostCategoryDto,
    @Param('userId') userId: number,
  ): Promise<CostCategory | ApiResponse> {
    return await this.costService.editCategory(data, userId);
  }

  @Get('category/all/:userId')
  async getAllCategories(@Param('userId') userId: number): Promise<CostCategory[]> {
    return await this.costService.getAllCategories(userId);
  }

  @Post('entry/add/:userId')
  async addEntry(
    @Body() data: AddCostEntryDto,
    @Param('userId') userId: number,
  ): Promise<CostEntry | ApiResponse> {
    return await this.costService.addEntry(data, userId);
  }

  @Post('entry/edit/:costId')
  async editEntry(
    @Body() data: EditCostEntryDto,
    @Param('costId') costId: number,
  ): Promise<CostEntry | ApiResponse> {
    return await this.costService.editEntry(data, costId);
  }

  @Get('entry/all/:costsId/:userId')
  async getAllEntries(
    @Param('userId') userId: number,
    @Param('costsId') costsId: number,
  ): Promise<CostEntry[]> {
    return await this.costService.getAllEntries(costsId, userId);
  }

  @Get('entry/all-by-supplier/:costsId/:supplierId/:userId')
  async getAllEntriesBySupplier(
    @Param('userId') userId: number,
    @Param('costsId') costsId: number,
    @Param('supplierId') supplierId: number,
  ): Promise<CostEntry[]> {
    return await this.costService.getAllEntriesBySupplier(costsId, userId, supplierId);
  }
}
