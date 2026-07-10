import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, QueryFailedError, Repository } from 'typeorm';

import { Carpet } from './carpet.entity';
import { CarpetService } from './carpet.service';
import { AddCarpetDto } from './dto/add-carpet.dto';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('CarpetService', () => {
  let service: CarpetService;
  let carpetRepository: MockRepository<Carpet>;

  beforeEach(async () => {
    const mockCarpetRepositoryFactory = (): MockRepository<Carpet> => ({
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarpetService,
        {
          provide: getRepositoryToken(Carpet),
          useFactory: mockCarpetRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<CarpetService>(CarpetService);
    carpetRepository = module.get<MockRepository<Carpet>>(getRepositoryToken(Carpet));
  });

  describe('addCarpet', () => {
    it('should successfully create a carpet and correctly calculate surface and price (Happy Path)', async () => {
      const dto: AddCarpetDto = {
        carpetReception: 1,
        width: 2.5,
        height: 3.0,
        price: 300,
        workerId: 10,
        deliveryDate: '2026-07-15',
        clientsId: 5,
      };
      const userId = 1;

      carpetRepository.create!.mockImplementation((data) => data);

      carpetRepository.save!.mockImplementation(async (carpet) => {
        return {
          carpetId: 100,
          ...(carpet as object),
        } as Carpet;
      });

      const result = await service.addCarpet(dto, userId);

      expect(carpetRepository.create).toHaveBeenCalled();

      expect(carpetRepository.create).toHaveBeenCalled();
      expect(result.carpetSurface).toBe(7.5);
      expect(result.forPayment).toBe(2250);
    });

    it('should throw BadRequestException if client, worker, or user does not exist (SQL FK Error)', async () => {
      const dto: AddCarpetDto = {
        carpetReception: 1,
        width: 2,
        height: 3,
        price: 200,
        workerId: 999,
        deliveryDate: '2026-07-15',
        clientsId: 5,
      };

      carpetRepository.create!.mockImplementation((data) => data);

      const dbError = new Error('Foreign key constraint fails');

      Object.assign(dbError, {
        errno: 1452,
        code: 'ER_NO_REFERENCED_ROW_2',
      });

      const queryFailedError = new QueryFailedError('INSERT...', [], dbError);

      carpetRepository.save!.mockRejectedValue(queryFailedError);

      await expect(service.addCarpet(dto, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if the database fails for any other reason', async () => {
      const dto = {} as AddCarpetDto;
      carpetRepository.create!.mockReturnValue({});
      carpetRepository.save!.mockRejectedValue(new Error('Database connection lost'));

      await expect(service.addCarpet(dto, 1)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('editCarpet', () => {
    it('should successfully edit a carpet and recalculate financials when width changes', async () => {
      const carpetId = 100;
      const userId = 1;
      const dto = { width: 4.0 };

      const existingCarpet = {
        carpetId,
        userId,
        width: 2.5,
        height: 3.0,
        price: 300,
        carpetSurface: 7.5,
        forPayment: 2250,
      } as Carpet;

      carpetRepository.findOne!.mockResolvedValue(existingCarpet);
      carpetRepository.save!.mockImplementation(async (carpet) => carpet as Carpet);

      const result = await service.editCarpet(carpetId, dto, userId);

      expect(carpetRepository.findOne).toHaveBeenCalledWith({ where: { carpetId, userId } });

      expect(result.width).toBe(4.0);
      expect(result.carpetSurface).toBe(12);
      expect(result.forPayment).toBe(3600);
      expect(carpetRepository.save).toHaveBeenCalledWith(result);
    });

    it('should throw NotFoundException if the carpet does not exist or belongs to another user', async () => {
      carpetRepository.findOne!.mockResolvedValue(null);

      await expect(service.editCarpet(999, { price: 400 }, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
