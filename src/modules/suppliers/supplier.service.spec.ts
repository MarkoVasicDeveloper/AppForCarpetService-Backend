import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

import { AddSupplierDto } from './dto/add-supplier.dto';
import { EditSupplierDto } from './dto/edit-supplier.dto';
import { Supplier } from './supplier.entity';
import { SupplierService } from './supplier.service';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('SupplierService', () => {
  let service: SupplierService;
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
        SupplierService,
        {
          provide: getRepositoryToken(Supplier),
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
    supplierRepository = module.get<MockRepository<Supplier>>(getRepositoryToken(Supplier));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addSupplier', () => {
    const dto: AddSupplierDto = {
      name: 'Lukoil',
      address: 'Main Road 4',
      pib: '123456789',
      bankAccount: '160-12345-67',
    };
    const userId = 1;

    it('should throw ConflictException if supplier name already exists for user', async () => {
      supplierRepository.findOne!.mockResolvedValue({ id: 10 } as Supplier);

      await expect(service.addSupplier(dto, userId)).rejects.toThrow(ConflictException);
    });

    it('should successfully create a supplier if name is unique', async () => {
      supplierRepository.findOne!.mockResolvedValue(null);
      supplierRepository.create!.mockImplementation((data) => data);
      supplierRepository.save!.mockImplementation(
        async (sup) => ({ id: 10, ...(sup as object) }) as Supplier,
      );

      const result = await service.addSupplier(dto, userId);

      expect(supplierRepository.findOne).toHaveBeenCalledWith({
        where: { userId, name: dto.name },
      });
      expect(result.id).toBe(10);
      expect(result.name).toBe('Lukoil');
    });
  });

  describe('getAllSuppliers', () => {
    it('should return all suppliers for user ordered by name ascending', async () => {
      const userId = 1;
      const mockSuppliers = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ] as Supplier[];
      supplierRepository.find!.mockResolvedValue(mockSuppliers);

      const result = await service.getAllSuppliers(userId);

      expect(supplierRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockSuppliers);
    });
  });

  describe('getSupplierById', () => {
    it('should return supplier if found', async () => {
      const mockSupplier = { id: 10, userId: 1, name: 'Lukoil' } as Supplier;
      supplierRepository.findOne!.mockResolvedValue(mockSupplier);

      const result = await service.getSupplierById(10, 1);

      expect(supplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 10, userId: 1 },
        relations: ['costs'],
      });
      expect(result).toEqual(mockSupplier);
    });

    it('should throw NotFoundException if supplier is not found', async () => {
      supplierRepository.findOne!.mockResolvedValue(null);

      await expect(service.getSupplierById(10, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('editSupplier', () => {
    const id = 10;
    const userId = 1;

    it('should successfully update supplier when name is not changed', async () => {
      const existingSupplier = { id, userId, name: 'Lukoil', address: 'Old Address' } as Supplier;
      const dto: EditSupplierDto = { address: 'New Address' };

      supplierRepository.findOne!.mockResolvedValue(existingSupplier);
      supplierRepository.merge!.mockImplementation((sup, data) => Object.assign(sup, data));
      supplierRepository.save!.mockImplementation(async (sup) => sup as Supplier);

      const result = await service.editSupplier(id, userId, dto);

      expect(result.address).toBe('New Address');
      expect(supplierRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if trying to change name to an already existing supplier name', async () => {
      const existingSupplier = { id, userId, name: 'Lukoil' } as Supplier;
      const dto: EditSupplierDto = { name: 'NIS Petrol' };

      supplierRepository.findOne!.mockResolvedValueOnce(existingSupplier);
      supplierRepository.findOne!.mockResolvedValueOnce({ id: 20, name: 'NIS Petrol' } as Supplier);

      await expect(service.editSupplier(id, userId, dto)).rejects.toThrow(ConflictException);
      expect(supplierRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'NIS Petrol', userId },
      });
    });
  });

  describe('deleteSupplier', () => {
    it('should throw NotFoundException if no rows were affected by delete', async () => {
      supplierRepository.delete!.mockResolvedValue({ affected: 0 });

      await expect(service.deleteSupplier(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should successfully delete supplier if record exists', async () => {
      supplierRepository.delete!.mockResolvedValue({ affected: 1 });

      await expect(service.deleteSupplier(1, 1)).resolves.not.toThrow();
      expect(supplierRepository.delete).toHaveBeenCalledWith({ id: 1, userId: 1 });
    });
  });
});
