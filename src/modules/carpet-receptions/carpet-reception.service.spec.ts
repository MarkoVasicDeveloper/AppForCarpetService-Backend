import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

import { ClientsService } from '../clients/clients.service';

import { CarpetReception } from './carpet-reception.entity';
import { CarpetReceptionsService } from './carpet-reception.service';
import { AddCarpetReceptionDto } from './dto/add-carpet-reception.dto';
import { EditCarpetReception } from './dto/edit-carpet-reception.dto';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

type MockService<T> = {
  [P in keyof T]?: jest.Mock;
};

describe('CarpetReceptionsService', () => {
  let service: CarpetReceptionsService;
  let carpetReceptionRepo: MockRepository<CarpetReception>;
  let clientsService: MockService<ClientsService>;

  beforeEach(async () => {
    const mockCarpetReceptionRepoFactory = (): MockRepository<CarpetReception> => ({
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      merge: jest.fn(),
    });

    const mockClientsServiceFactory = (): MockService<ClientsService> => ({
      getClientById: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarpetReceptionsService,
        {
          provide: getRepositoryToken(CarpetReception),
          useFactory: mockCarpetReceptionRepoFactory,
        },
        {
          provide: ClientsService,
          useFactory: mockClientsServiceFactory,
        },
      ],
    }).compile();

    service = module.get<CarpetReceptionsService>(CarpetReceptionsService);
    carpetReceptionRepo = module.get<MockRepository<CarpetReception>>(
      getRepositoryToken(CarpetReception),
    );
    clientsService = module.get<MockService<ClientsService>>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addCarpetReception', () => {
    it('should successfully create a carpet reception when client exists (Happy Path)', async () => {
      const dto: AddCarpetReceptionDto = {
        userId: 1,
        clientsId: 5,
        numberOfCarpet: 3,
        numberOfTracks: 2,
        note: 'Careful with the edges',
        carpetReceptionUser: 10,
      };
      const workerId = 2;

      clientsService.getClientById!.mockResolvedValue({ clientsId: 5 });
      carpetReceptionRepo.create!.mockImplementation((data) => data);
      carpetReceptionRepo.save!.mockImplementation(
        async (reception) =>
          ({
            carpetReception: 100,
            ...(reception as object),
          }) as CarpetReception,
      );

      const result = await service.addCarpetReception(dto, workerId);

      expect(clientsService.getClientById).toHaveBeenCalledWith(dto.clientsId, dto.userId);
      expect(carpetReceptionRepo.create).toHaveBeenCalled();
      expect(result.userId).toBe(dto.userId);
      expect(result.numberOfCarpet).toBe(3);
    });

    it('should fallback to workerId as targetUserId when data.userId is missing', async () => {
      const dto: AddCarpetReceptionDto = {
        clientsId: 5,
        carpetReceptionUser: 10,
      };
      const workerId = 2;

      clientsService.getClientById!.mockResolvedValue({ clientsId: 5 });
      carpetReceptionRepo.create!.mockImplementation((data) => data);
      carpetReceptionRepo.save!.mockImplementation(
        async (reception) => reception as CarpetReception,
      );

      const result = await service.addCarpetReception(dto, workerId);

      expect(clientsService.getClientById).toHaveBeenCalledWith(dto.clientsId, workerId);
      expect(result.userId).toBe(workerId);
    });

    it('should throw NotFoundException if client does not exist', async () => {
      const dto: AddCarpetReceptionDto = {
        clientsId: 999,
        carpetReceptionUser: 10,
      };
      clientsService.getClientById!.mockResolvedValue(null);

      await expect(service.addCarpetReception(dto, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('editCarpetReception', () => {
    it('should successfully update and merge carpet reception data', async () => {
      const dto: EditCarpetReception = {
        carpetReceptionId: 50,
        userId: 1,
        deliveredTime: new Date('2026-07-10'),
      };
      const workerId = 3;

      const existingReception = {
        carpetReceptionUser: 50,
        userId: 1,
        workerId: 2,
      } as CarpetReception;

      carpetReceptionRepo.findOne!.mockResolvedValue(existingReception);
      carpetReceptionRepo.merge!.mockImplementation((reception, data) =>
        Object.assign(reception, data),
      );
      carpetReceptionRepo.save!.mockImplementation(
        async (reception) => reception as CarpetReception,
      );

      const result = await service.editCarpetReception(dto, workerId);

      expect(carpetReceptionRepo.findOne).toHaveBeenCalledWith({
        where: { carpetReceptionUser: dto.carpetReceptionId, userId: dto.userId },
      });
      expect(result.workerId).toBe(workerId);
      expect(result.deliveryTime).toEqual(dto.deliveredTime);
      expect(carpetReceptionRepo.save).toHaveBeenCalledWith(result);
    });

    it('should throw NotFoundException if reception record to edit is not found', async () => {
      const dto: EditCarpetReception = { carpetReceptionId: 999 };
      carpetReceptionRepo.findOne!.mockResolvedValue(null);

      await expect(service.editCarpetReception(dto, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getReceptionById', () => {
    it('should throw NotFoundException if reception by ID does not exist', async () => {
      carpetReceptionRepo.findOne!.mockResolvedValue(null);

      await expect(service.getReceptionById(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllReceptionsOrderedForClient', () => {
    it('should throw NotFoundException if receptions array is empty', async () => {
      carpetReceptionRepo.find!.mockResolvedValue([]);

      await expect(service.getAllReceptionsOrderedForClient(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
