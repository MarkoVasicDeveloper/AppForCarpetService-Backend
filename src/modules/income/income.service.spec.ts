import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

import { AddIncomeCategoryDto } from './dto/add-income-category.dto';
import { AddIncomeEntryDto } from './dto/add-income-entry.dto';
import { EditIncomeEntryDto } from './dto/edit-income-entry.dto';
import { IncomeCategory } from './entities/income-category.entity';
import { IncomeEntry } from './entities/income-entry.entity';
import { IncomeService } from './income.service';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('IncomeService', () => {
  let service: IncomeService;
  let categoryRepository: MockRepository<IncomeCategory>;
  let entryRepository: MockRepository<IncomeEntry>;

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
        IncomeService,
        {
          provide: getRepositoryToken(IncomeCategory),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(IncomeEntry),
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<IncomeService>(IncomeService);
    categoryRepository = module.get<MockRepository<IncomeCategory>>(
      getRepositoryToken(IncomeCategory),
    );
    entryRepository = module.get<MockRepository<IncomeEntry>>(getRepositoryToken(IncomeEntry));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addCategory', () => {
    it('should throw ConflictException if category name already exists for user', async () => {
      const dto: AddIncomeCategoryDto = { name: 'Carpet Cleaning' };
      categoryRepository.findOne!.mockResolvedValue({ id: 1 } as IncomeCategory);

      await expect(service.addCategory(dto, 1)).rejects.toThrow(ConflictException);
    });

    it('should successfully create a category if it does not exist', async () => {
      const dto: AddIncomeCategoryDto = { name: 'Carpet Cleaning' };
      categoryRepository.findOne!.mockResolvedValue(null);
      categoryRepository.create!.mockImplementation((data) => data);
      categoryRepository.save!.mockImplementation(
        async (cat) => ({ id: 10, ...(cat as object) }) as IncomeCategory,
      );

      const result = await service.addCategory(dto, 1);

      expect(result.id).toBe(10);
      expect(categoryRepository.save).toHaveBeenCalled();
    });
  });

  describe('addEntry', () => {
    const dto: AddIncomeEntryDto = { categoryId: 2, value: 5000, name: 'Large rug cleaning' };
    const userId = 1;

    it('should successfully add an income entry when category exists', async () => {
      categoryRepository.findOne!.mockResolvedValue({ id: 2 } as IncomeCategory);
      entryRepository.create!.mockImplementation((data) => data);
      entryRepository.save!.mockImplementation(
        async (entry) => ({ id: 100, ...(entry as object) }) as IncomeEntry,
      );

      const result = await service.addEntry(dto, userId);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.categoryId, userId },
      });
      expect(result.id).toBe(100);
    });

    it('should throw NotFoundException if target income category is not found', async () => {
      categoryRepository.findOne!.mockResolvedValue(null);

      await expect(service.addEntry(dto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllEntriesFromCategory', () => {
    const categoryId = 2;
    const userId = 1;

    it('should return entries if they exist for the category', async () => {
      const mockEntries = [{ id: 100, categoryId, userId }] as IncomeEntry[];
      entryRepository.find!.mockResolvedValue(mockEntries);

      const result = await service.getAllEntriesFromCategory(categoryId, userId);

      expect(result).toEqual(mockEntries);
      expect(categoryRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if entries are empty and category does not exist', async () => {
      entryRepository.find!.mockResolvedValue([]);
      categoryRepository.findOne!.mockResolvedValue(null);

      await expect(service.getAllEntriesFromCategory(categoryId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId, userId },
      });
    });
  });

  describe('editEntry', () => {
    it('should successfully edit entry and validate new category if provided', async () => {
      const entryId = 100;
      const userId = 1;
      const dto: EditIncomeEntryDto = { categoryId: 5, value: 6000 };

      const existingEntry = { id: entryId, userId, value: 4000 } as IncomeEntry;
      entryRepository.findOne!.mockResolvedValue(existingEntry);
      categoryRepository.findOne!.mockResolvedValue({ id: 5 } as IncomeCategory);
      entryRepository.merge!.mockImplementation((entry, data) => Object.assign(entry, data));
      entryRepository.save!.mockImplementation(async (entry) => entry as IncomeEntry);

      const result = await service.editEntry(entryId, userId, dto);

      expect(entryRepository.findOne).toHaveBeenCalledWith({
        where: { id: entryId, userId },
        relations: ['category'],
      });
      expect(categoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 5, userId } });
      expect(result.value).toBe(6000);
    });

    it('should throw NotFoundException during edit if new category does not exist', async () => {
      const entryId = 100;
      const userId = 1;
      const dto: EditIncomeEntryDto = { categoryId: 999 };

      entryRepository.findOne!.mockResolvedValue({ id: entryId, userId } as IncomeEntry);
      categoryRepository.findOne!.mockResolvedValue(null);

      await expect(service.editEntry(entryId, userId, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteEntry', () => {
    it('should throw NotFoundException if no rows were affected by delete', async () => {
      entryRepository.delete!.mockResolvedValue({ affected: 0 });

      await expect(service.deleteEntry(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should successfully delete entry if record exists', async () => {
      entryRepository.delete!.mockResolvedValue({ affected: 1 });

      await expect(service.deleteEntry(1, 1)).resolves.not.toThrow();
      expect(entryRepository.delete).toHaveBeenCalledWith({ id: 1, userId: 1 });
    });
  });
});
