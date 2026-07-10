import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

import { Supplier } from '../suppliers/supplier.entity';

import { CostService } from './cost.service';
import { AddCostCategoryDto } from './dto/add-cost-category.dto';
import { AddCostEntryDto } from './dto/add-cost-entry.dto';
import { EditCostEntryDto } from './dto/edit-cost-entry.dto';
import { CostCategory } from './entities/cost-category.entity';
import { CostEntry } from './entities/cost-entry.entity';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('CostService', () => {
  let service: CostService;
  let categoryRepository: MockRepository<CostCategory>;
  let entryRepository: MockRepository<CostEntry>;
  let supplierRepository: MockRepository<Supplier>;

  beforeEach(async () => {
    const mockRepositoryFactory = (): MockRepository<object> => ({
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      merge: jest.fn(),
      delete: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostService,
        {
          provide: getRepositoryToken(CostCategory),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(CostEntry),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(Supplier),
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<CostService>(CostService);
    categoryRepository = module.get<MockRepository<CostCategory>>(getRepositoryToken(CostCategory));
    entryRepository = module.get<MockRepository<CostEntry>>(getRepositoryToken(CostEntry));
    supplierRepository = module.get<MockRepository<Supplier>>(getRepositoryToken(Supplier));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addCategory', () => {
    it('should throw ConflictException if category title already exists for user', async () => {
      const dto: AddCostCategoryDto = { title: 'Rent' };
      categoryRepository.findOne!.mockResolvedValue({ id: 1 } as CostCategory);

      await expect(service.addCategory(dto, 1)).rejects.toThrow(ConflictException);
    });

    it('should successfully create a category if it does not exist', async () => {
      const dto: AddCostCategoryDto = { title: 'Rent' };
      categoryRepository.findOne!.mockResolvedValue(null);
      categoryRepository.create!.mockImplementation((data) => data);
      categoryRepository.save!.mockImplementation(
        async (cat) => ({ id: 10, ...(cat as object) }) as CostCategory,
      );

      const result = await service.addCategory(dto, 1);

      expect(result.id).toBe(10);
      expect(categoryRepository.save).toHaveBeenCalled();
    });
  });

  describe('addEntry', () => {
    const dto: AddCostEntryDto = {
      categoryId: 2,
      supplierId: 3,
      product: '',
      quantity: 0,
      price: 0,
      paid: false,
    };
    const userId = 1;

    it('should successfully add a cost entry when category and supplier exist (Happy Path)', async () => {
      categoryRepository.findOne!.mockResolvedValue({ id: 2 } as CostCategory);
      supplierRepository.findOne!.mockResolvedValue({ id: 3 } as Supplier);
      entryRepository.create!.mockImplementation((data) => data);
      entryRepository.save!.mockImplementation(
        async (entry) => ({ id: 100, ...(entry as object) }) as CostEntry,
      );

      const result = await service.addEntry(dto, userId);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.categoryId, userId },
      });
      expect(supplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.supplierId, userId },
      });
      expect(result.id).toBe(100);
    });

    it('should throw NotFoundException if target cost category is not found', async () => {
      categoryRepository.findOne!.mockResolvedValue(null);

      await expect(service.addEntry(dto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if target supplier is not found', async () => {
      categoryRepository.findOne!.mockResolvedValue({ id: 2 } as CostCategory);
      supplierRepository.findOne!.mockResolvedValue(null);

      await expect(service.addEntry(dto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('editEntry', () => {
    it('should successfully edit entry and validate new category and supplier if provided', async () => {
      const entryId = 100;
      const userId = 1;

      const dto: EditCostEntryDto = { categoryId: 5, supplierId: 6, price: 500, quantity: 4 };

      const existingEntry = { id: entryId, userId, price: 300, quantity: 2 } as CostEntry;

      entryRepository.findOne!.mockResolvedValue(existingEntry);
      categoryRepository.findOne!.mockResolvedValue({ id: 5 } as CostCategory);
      supplierRepository.findOne!.mockResolvedValue({ id: 6 } as Supplier);

      entryRepository.merge!.mockImplementation((entry, data) => Object.assign(entry, data));
      entryRepository.save!.mockImplementation(async (entry) => entry as CostEntry);

      const result = await service.editEntry(entryId, userId, dto);

      expect(entryRepository.findOne).toHaveBeenCalledWith({
        where: { id: entryId, userId },
        relations: ['category', 'supplier'],
      });
      expect(categoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 5, userId } });
      expect(supplierRepository.findOne).toHaveBeenCalledWith({ where: { id: 6, userId } });
      expect(result.price).toBe(500);
      expect(result.quantity).toBe(4);
    });
  });

  describe('deleteCategory', () => {
    it('should throw NotFoundException if no rows were affected by delete', async () => {
      categoryRepository.delete!.mockResolvedValue({ affected: 0 });

      await expect(service.deleteCategory(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should successfully delete category if record exists', async () => {
      categoryRepository.delete!.mockResolvedValue({ affected: 1 });

      await expect(service.deleteCategory(1, 1)).resolves.not.toThrow();
      expect(categoryRepository.delete).toHaveBeenCalledWith({ id: 1, userId: 1 });
    });
  });
});
