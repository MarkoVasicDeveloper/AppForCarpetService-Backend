import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponse } from 'src/shared/response/api-response';
import { Repository } from 'typeorm';

import { AddCostCategoryDto } from './dto/add-cost-category.dto';
import { AddCostEntryDto } from './dto/add-cost-entry.dto';
import { EditCostCategoryDto } from './dto/edit-cost-category.dto';
import { EditCostEntryDto } from './dto/edit-cost-entry.dto';
import { CostCategory } from './entities/cost-category.entity';
import { CostEntry } from './entities/cost-entry.entity';

@Injectable()
export class CostService {
  constructor(
    @InjectRepository(CostCategory)
    private readonly categoryRepo: Repository<CostCategory>,

    @InjectRepository(CostEntry)
    private readonly entryRepo: Repository<CostEntry>,
  ) {}

  async addCategory(data: AddCostCategoryDto, userId: number): Promise<CostCategory | ApiResponse> {
    const exists = await this.categoryRepo.findOne({
      where: { title: data.title },
    });

    if (exists) return new ApiResponse(false, -4001, 'Category exists');

    const newCategory = new CostCategory();
    newCategory.title = data.title;
    newCategory.userId = userId;

    return await this.categoryRepo.save(newCategory);
  }

  async editCategory(
    data: EditCostCategoryDto,
    userId: number,
  ): Promise<CostCategory | ApiResponse> {
    const category = await this.categoryRepo.findOne({
      where: { title: data.title, userId: userId },
    });

    if (!category) return new ApiResponse(false, -4002, 'Category not found.');

    category.title = data.editTitle;
    return await this.categoryRepo.save(category);
  }

  async getAllCategories(userId: number): Promise<CostCategory[]> {
    return await this.categoryRepo.find({
      where: { userId: userId },
    });
  }

  async addEntry(data: AddCostEntryDto, userId: number): Promise<CostEntry | ApiResponse> {
    const newCost = new CostEntry();
    newCost.costsId = data.costsId;
    newCost.suppliersId = data.suppliersId;
    newCost.userId = userId;
    newCost.quantity = data.quantity;
    newCost.product = data.product;
    newCost.price = data.price;
    newCost.paid = data.paid;
    if (data.maturityData) newCost.maturityData = data.maturityData;

    return await this.entryRepo.save(newCost);
  }

  async editEntry(data: EditCostEntryDto, costId: number): Promise<CostEntry | ApiResponse> {
    const cost = await this.entryRepo.findOne({
      where: {
        costId: costId,
        userId: data.userId,
      },
    });
    if (!cost) return new ApiResponse(false, -4003, 'No such cost found');

    if (data.maturityData !== undefined) cost.maturityData = data.maturityData;
    if (data.paid !== undefined) cost.paid = data.paid;
    if (data.price !== undefined) cost.price = data.price;
    if (data.quantity !== undefined) cost.quantity = data.quantity;
    if (data.product !== undefined) cost.product = data.product;
    if (data.suppliersId !== undefined) cost.suppliersId = data.suppliersId;

    return await this.entryRepo.save(cost);
  }

  async getAllEntries(costsId: number, userId: number): Promise<CostEntry[]> {
    return await this.entryRepo.find({
      where: { userId: userId, costsId: costsId },
    });
  }

  async getAllEntriesBySupplier(
    costsId: number,
    userId: number,
    supplierId: number,
  ): Promise<CostEntry[]> {
    return await this.entryRepo.find({
      where: { userId: userId, costsId: costsId, suppliersId: supplierId },
    });
  }
}
