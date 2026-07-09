import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Supplier } from '../suppliers/supplier.entity';

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

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
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

  async getAllCategories(userId: number): Promise<CostCategory[]> {
    return await this.categoryRepository.find({ where: { userId } });
  }

  async getCategoryById(id: number, userId: number): Promise<CostCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
      relations: ['entries'],
    });

    if (!category) {
      throw new NotFoundException('Cost category not found or access denied.');
    }
    return category;
  }

  async editCategory(id: number, userId: number, data: EditCostCategoryDto): Promise<CostCategory> {
    const category = await this.getCategoryById(id, userId);
    this.categoryRepository.merge(category, data);
    return await this.categoryRepository.save(category);
  }

  async deleteCategory(id: number, userId: number): Promise<void> {
    const result = await this.categoryRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Cost category not found or access denied.');
    }
  }

  async addEntry(data: AddCostEntryDto, userId: number): Promise<CostEntry> {
    const categoryExists = await this.categoryRepository.findOne({
      where: { id: data.categoryId, userId },
    });
    if (!categoryExists) {
      throw new NotFoundException('Target cost category not found or access denied.');
    }

    const supplierExists = await this.supplierRepository.findOne({
      where: { id: data.supplierId, userId },
    });
    if (!supplierExists) {
      throw new NotFoundException('Target supplier not found or access denied.');
    }

    const newEntry = this.entryRepository.create({ ...data, userId });
    return await this.entryRepository.save(newEntry);
  }

  async getAllEntriesFromCategory(categoryId: number, userId: number): Promise<CostEntry[]> {
    const categoryExists = await this.categoryRepository.findOne({
      where: { id: categoryId, userId },
    });
    if (!categoryExists) {
      throw new NotFoundException('Cost category not found or access denied.');
    }

    return await this.entryRepository.find({
      where: { categoryId, userId },
      relations: ['category', 'supplier'],
      order: { id: 'DESC' },
    });
  }

  async getAllEntriesFromSupplier(supplierId: number, userId: number): Promise<CostEntry[]> {
    const supplierExists = await this.supplierRepository.findOne({
      where: { id: supplierId, userId },
    });
    if (!supplierExists) {
      throw new NotFoundException('Supplier not found or access denied.');
    }

    return await this.entryRepository.find({
      where: { supplierId, userId },
      relations: ['category', 'supplier'],
      order: { id: 'DESC' },
    });
  }

  async getEntryById(id: number, userId: number): Promise<CostEntry> {
    const entry = await this.entryRepository.findOne({
      where: { id, userId },
      relations: ['category', 'supplier'],
    });

    if (!entry) {
      throw new NotFoundException('Cost entry not found or access denied.');
    }
    return entry;
  }

  async editEntry(id: number, userId: number, data: EditCostEntryDto): Promise<CostEntry> {
    const entry = await this.getEntryById(id, userId);

    if (data.categoryId) {
      const categoryExists = await this.categoryRepository.findOne({
        where: { id: data.categoryId, userId },
      });
      if (!categoryExists) throw new NotFoundException('Target cost category not found.');
    }

    if (data.supplierId) {
      const supplierExists = await this.supplierRepository.findOne({
        where: { id: data.supplierId, userId },
      });
      if (!supplierExists) throw new NotFoundException('Target supplier not found.');
    }

    this.entryRepository.merge(entry, data);
    return await this.entryRepository.save(entry);
  }

  async deleteEntry(id: number, userId: number): Promise<void> {
    const result = await this.entryRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Cost entry not found or access denied.');
    }
  }
}
