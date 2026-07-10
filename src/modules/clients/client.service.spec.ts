import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ILike, ObjectLiteral } from 'typeorm';

import { Client } from './client.entity';
import { ClientsService } from './clients.service';
import { AddClientsDto } from './dto/add-clients.dto';
import { EditClientDto } from './dto/edit-client.dto';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('ClientsService', () => {
  let service: ClientsService;
  let clientRepository: MockRepository<Client>;

  beforeEach(async () => {
    const mockClientRepositoryFactory = (): MockRepository<Client> => ({
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useFactory: mockClientRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    clientRepository = module.get<MockRepository<Client>>(getRepositoryToken(Client));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addClients', () => {
    const dto: AddClientsDto = {
      name: 'John',
      surname: 'Doe',
      address: 'Main Street 12',
    };
    const userId = 1;

    it('should successfully add a client if they do not exist (Happy Path)', async () => {
      clientRepository.findOne!.mockResolvedValue(null);
      clientRepository.create!.mockImplementation((data) => data);
      clientRepository.save!.mockImplementation(
        async (client) =>
          ({
            clientsId: 100,
            ...(client as object),
          }) as Client,
      );

      const result = await service.addClients(dto, userId);

      expect(clientRepository.findOne).toHaveBeenCalledWith({
        where: { name: dto.name, surname: dto.surname, address: dto.address, userId },
      });
      expect(clientRepository.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(result.clientsId).toBe(100);
    });

    it('should throw ConflictException if a client with the same details already exists', async () => {
      clientRepository.findOne!.mockResolvedValue({ clientsId: 100 } as Client);

      await expect(service.addClients(dto, userId)).rejects.toThrow(ConflictException);
    });
  });

  describe('editClient', () => {
    it('should successfully merge and update client details', async () => {
      const clientId = 100;
      const userId = 1;
      const dto: EditClientDto = { address: 'New Address 45' };
      const existingClient = { clientsId: clientId, userId, name: 'John' } as Client;

      clientRepository.findOne!.mockResolvedValue(existingClient);
      clientRepository.merge!.mockImplementation((client, data) => Object.assign(client, data));
      clientRepository.save!.mockImplementation(async (client) => client as Client);

      const result = await service.editClient(clientId, dto, userId);

      expect(clientRepository.findOne).toHaveBeenCalledWith({
        where: { clientsId: clientId, userId },
      });
      expect(clientRepository.merge).toHaveBeenCalledWith(existingClient, dto);
      expect(result.address).toBe('New Address 45');
    });

    it('should throw NotFoundException if client to edit is not found', async () => {
      clientRepository.findOne!.mockResolvedValue(null);

      await expect(service.editClient(999, {}, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getClientById', () => {
    it('should return a client if found', async () => {
      const mockClient = { clientsId: 1, userId: 1, name: 'John' } as Client;
      clientRepository.findOne!.mockResolvedValue(mockClient);

      const result = await service.getClientById(1, 1);

      expect(clientRepository.findOne).toHaveBeenCalledWith({
        where: { clientsId: 1, userId: 1 },
        relations: ['carpetReceptions'],
      });
      expect(result).toEqual(mockClient);
    });

    it('should throw NotFoundException if client is not found', async () => {
      clientRepository.findOne!.mockResolvedValue(null);

      await expect(service.getClientById(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchClients', () => {
    it('should dynamically build the where clause with ILike filters', async () => {
      const userId = 1;
      const searchParams = { name: 'John', address: 'Main' };
      clientRepository.find!.mockResolvedValue([] as Client[]);

      await service.searchClients(userId, searchParams);

      expect(clientRepository.find).toHaveBeenCalledWith({
        where: {
          userId,
          name: ILike('%John%'),
          address: ILike('%Main%'),
        },
        relations: ['carpetReceptions'],
        order: { name: 'ASC' },
      });
    });
  });

  describe('deleteClient', () => {
    it('should successfully remove a client if found', async () => {
      const clientId = 100;
      const userId = 1;
      const existingClient = { clientsId: clientId, userId } as Client;

      clientRepository.findOne!.mockResolvedValue(existingClient);
      clientRepository.remove!.mockResolvedValue(existingClient);

      await service.deleteClient(clientId, userId);

      expect(clientRepository.findOne).toHaveBeenCalledWith({
        where: { clientsId: clientId, userId },
      });
      expect(clientRepository.remove).toHaveBeenCalledWith(existingClient);
    });

    it('should throw NotFoundException if client to delete is not found', async () => {
      clientRepository.findOne!.mockResolvedValue(null);

      await expect(service.deleteClient(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
