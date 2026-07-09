import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    private readonly categoryRepository: Repository<IncomeCategory>,

    @InjectRepository(IncomeEntry)
    private readonly entryRepository: Repository<IncomeEntry>,
  ) {}

  async addCategory(data: AddIncomeCategoryDto, userId: number): Promise<IncomeCategory> {
    const exists = await this.categoryRepository.findOne({
      where: { name: data.name, userId },
    });

    if (exists) {
      throw new ConflictException('Income category with this name already exists.');
    }

    const category = this.categoryRepository.create({ ...data, userId });
    return await this.categoryRepository.save(category);
  }

  async editCategory(
    id: number,
    userId: number,
    data: EditIncomeCategoryDto,
  ): Promise<IncomeCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Income category not found.');
    }

    this.categoryRepository.merge(category, data);
    return await this.categoryRepository.save(category);
  }

  async getAllCategories(userId: number): Promise<IncomeCategory[]> {
    return await this.categoryRepository.find({ where: { userId } });
  }

  async deleteCategory(id: number, userId: number): Promise<void> {
    const result = await this.categoryRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Income category not found or access denied.');
    }
  }

  async addEntry(data: AddIncomeEntryDto, userId: number): Promise<IncomeEntry> {
    const entry = this.entryRepository.create({ ...data, userId });
    return await this.entryRepository.save(entry);
  }

  async editEntry(id: number, userId: number, data: EditIncomeEntryDto): Promise<IncomeEntry> {
    const entry = await this.entryRepository.findOne({
      where: { id, userId },
    });

    if (!entry) {
      throw new NotFoundException('Income entry not found.');
    }

    this.entryRepository.merge(entry, data);
    return await this.entryRepository.save(entry);
  }

  async getAllEntriesFromCategory(incomeId: number, userId: number): Promise<IncomeEntry[]> {
    return await this.entryRepository.find({
      where: { incomeId, userId },
      order: { dateAt: 'DESC' },
    });
  }

  async deleteEntry(id: number, userId: number): Promise<void> {
    const result = await this.entryRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Income entry not found or access denied.');
    }
  }
}
