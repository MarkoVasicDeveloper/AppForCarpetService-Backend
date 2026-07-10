import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

import { AddSchedulingCarpetDto } from './dto/add-scheduling-carpet.dto';
import { EditSchedulingCarpetDto } from './dto/edit-scheduling-carpet.dto';
import { SchedulingCarpet } from './scheduling-carpet.entity';
import { SchedulingCarpetService } from './scheduling-carpet.service';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('SchedulingCarpetService', () => {
  let service: SchedulingCarpetService;
  let carpetRepository: MockRepository<SchedulingCarpet>;

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
        SchedulingCarpetService,
        {
          provide: getRepositoryToken(SchedulingCarpet),
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<SchedulingCarpetService>(SchedulingCarpetService);
    carpetRepository = module.get<MockRepository<SchedulingCarpet>>(
      getRepositoryToken(SchedulingCarpet),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addSchedulingCarpet', () => {
    it('should successfully create a scheduling record', async () => {
      const dto: AddSchedulingCarpetDto = {
        name: 'Marko',
        surname: 'Vasic',
        address: 'Dunavska 12',
        phone: '+38161234567',
        email: 'marko@example.com',
        note: 'Bring team of two',
      };
      const userId = 1;

      carpetRepository.create!.mockImplementation((data) => data);
      carpetRepository.save!.mockImplementation(
        async (record) => ({ id: 10, ...(record as object) }) as SchedulingCarpet,
      );

      const result = await service.addSchedulingCarpet(dto, userId);

      expect(carpetRepository.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(result.id).toBe(10);
      expect(result.name).toBe('Marko');
    });
  });

  describe('editSchedulingCarpet', () => {
    const id = 10;
    const userId = 1;
    const dto: EditSchedulingCarpetDto = { address: 'Nova Adresa 44' };

    it('should successfully update and merge scheduling data', async () => {
      const existingRecord = {
        id,
        userId,
        name: 'Marko',
        address: 'Dunavska 12',
      } as SchedulingCarpet;

      carpetRepository.findOne!.mockResolvedValue(existingRecord);
      carpetRepository.merge!.mockImplementation((record, data) => Object.assign(record, data));
      carpetRepository.save!.mockImplementation(async (record) => record as SchedulingCarpet);

      const result = await service.editSchedulingCarpet(id, userId, dto);

      expect(carpetRepository.findOne).toHaveBeenCalledWith({ where: { id, userId } });
      expect(carpetRepository.merge).toHaveBeenCalledWith(existingRecord, dto);
      expect(result.address).toBe('Nova Adresa 44');
    });

    it('should throw NotFoundException if scheduling record to edit does not exist', async () => {
      carpetRepository.findOne!.mockResolvedValue(null);

      await expect(service.editSchedulingCarpet(id, userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllScheduling', () => {
    it('should return scheduling records where isScheduling is false', async () => {
      const userId = 1;
      const mockList = [{ id: 1, userId, isScheduling: false }] as SchedulingCarpet[];
      carpetRepository.find!.mockResolvedValue(mockList);

      const result = await service.getAllScheduling(userId);

      expect(carpetRepository.find).toHaveBeenCalledWith({
        where: { userId, isScheduling: false },
        order: { timeAt: 'DESC' },
      });
      expect(result).toEqual(mockList);
    });
  });

  describe('deleteScheduling', () => {
    it('should throw NotFoundException if no rows were affected by delete', async () => {
      carpetRepository.delete!.mockResolvedValue({ affected: 0 });

      await expect(service.deleteScheduling(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should successfully delete record if it exists', async () => {
      carpetRepository.delete!.mockResolvedValue({ affected: 1 });

      await expect(service.deleteScheduling(1, 1)).resolves.not.toThrow();
      expect(carpetRepository.delete).toHaveBeenCalledWith({ id: 1, userId: 1 });
    });
  });
});
