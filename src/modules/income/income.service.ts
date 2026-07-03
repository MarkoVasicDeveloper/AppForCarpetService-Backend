import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponse } from 'src/shared/response/api-response';
import { Repository } from 'typeorm';

import { AddIncomeCategoryDto } from './dto/add-income-category.dto';
import { AddIncomeEntryDto } from './dto/add-income-entry.dto';
import { EditIncomeCategoryDto } from './dto/edit-income-category.dto';
import { EditIncomeEntryDto } from './dto/edit-income-entry.dto';
import { IncomeCategory } from './entities/income-category.entity';
import { IncomeEntry } from './entities/income-entry.entity';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(IncomeCategory)
    private readonly categoryRepo: Repository<IncomeCategory>,

    @InjectRepository(IncomeEntry)
    private readonly entryRepo: Repository<IncomeEntry>,
  ) {}

  async addCategory(
    data: AddIncomeCategoryDto,
    userId: number,
  ): Promise<IncomeCategory | ApiResponse> {
    const exists = await this.categoryRepo.findOne({
      where: {
        name: data.name,
        price: data.price,
        userId: userId,
      },
    });

    if (exists) return new ApiResponse(false, -11001, 'Income category already exists!');

    const category = new IncomeCategory();
    category.name = data.name;
    category.price = data.price;
    category.userId = userId;

    return await this.categoryRepo.save(category);
  }

  async editCategory(
    data: EditIncomeCategoryDto,
    userId: number,
  ): Promise<IncomeCategory | ApiResponse> {
    const category = await this.categoryRepo.findOne({
      where: {
        userId: userId,
        incomeId: data.incomeId,
      },
    });

    if (!category) return new ApiResponse(false, -11002, 'Income category not found');

    if (data.name) category.name = data.name;
    if (data.price) category.price = data.price;

    return await this.categoryRepo.save(category);
  }

  async getAllCategories(userId: number): Promise<IncomeCategory[]> {
    return await this.categoryRepo.find({
      where: { userId: userId },
    });
  }

  async addEntry(data: AddIncomeEntryDto): Promise<IncomeEntry | ApiResponse> {
    const entry = new IncomeEntry();
    entry.incomeId = data.incomeId;
    entry.value = data.value;
    entry.userId = data.userId;

    return await this.entryRepo.save(entry);
  }

  async editEntry(data: EditIncomeEntryDto): Promise<IncomeEntry | ApiResponse> {
    const entry = await this.entryRepo.findOne({
      where: {
        userId: data.userId,
        incomeId: data.incomeId,
      },
    });

    if (!entry) return new ApiResponse(false, -12001, 'Entry not found');

    if (data.incomeId) entry.incomeId = data.incomeId;
    if (data.value) entry.value = data.value;

    return await this.entryRepo.save(entry);
  }

  async getAllEntriesFromCategory(userId: number, incomeId: number): Promise<IncomeEntry[]> {
    return await this.entryRepo.find({
      where: {
        userId: userId,
        incomeId: incomeId,
      },
    });
  }
}
