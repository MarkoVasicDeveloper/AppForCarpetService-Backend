import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    private readonly categoryRepository: Repository<CostCategory>,

    @InjectRepository(CostEntry)
    private readonly entryRepository: Repository<CostEntry>,
  ) {}

  async addCategory(data: AddCostCategoryDto, userId: number): Promise<CostCategory> {
    const exists = await this.categoryRepository.findOne({
      where: { title: data.title, userId },
    });

    if (exists) {
      throw new ConflictException('Cost category with this title already exists.');
    }

    const newCategory = this.categoryRepository.create({ ...data, userId });
    return await this.categoryRepository.save(newCategory);
  }

  async editCategory(id: number, userId: number, data: EditCostCategoryDto): Promise<CostCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Cost category not found.');
    }

    this.categoryRepository.merge(category, data);
    return await this.categoryRepository.save(category);
  }

  async getAllCategories(userId: number): Promise<CostCategory[]> {
    return await this.categoryRepository.find({ where: { userId } });
  }

  async addEntry(data: AddCostEntryDto, userId: number): Promise<CostEntry> {
    const newEntry = this.entryRepository.create({ ...data, userId });
    return await this.entryRepository.save(newEntry);
  }

  async editEntry(id: number, userId: number, data: EditCostEntryDto): Promise<CostEntry> {
    const entry = await this.entryRepository.findOne({
      where: { id, userId },
    });

    if (!entry) {
      throw new NotFoundException('Cost entry not found.');
    }

    this.entryRepository.merge(entry, data);
    return await this.entryRepository.save(entry);
  }

  async getAllEntries(costsId: number, userId: number): Promise<CostEntry[]> {
    return await this.entryRepository.find({
      where: { costsId, userId },
    });
  }

  async getAllEntriesBySupplier(
    costsId: number,
    supplierId: number,
    userId: number,
  ): Promise<CostEntry[]> {
    return await this.entryRepository.find({
      where: { costsId, supplierId, userId },
    });
  }

  async deleteCategory(id: number, userId: number): Promise<void> {
    const result = await this.categoryRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(
        'Cost category not found or you do not have permission to delete it.',
      );
    }
  }

  async deleteEntry(id: number, userId: number): Promise<void> {
    const result = await this.entryRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(
        'Cost entry not found or you do not have permission to delete it.',
      );
    }
  }
}
