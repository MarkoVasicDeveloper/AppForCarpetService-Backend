import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError, ObjectLiteral } from 'typeorm';

import { Role } from '../../shared/enums/role.enum';
import { CryptoUtil } from '../../shared/utils/crypto.util';

import { AddWorkerDto } from './dto/add-worker.dto';
import { EditWorkerDto } from './dto/edit-worker.dto';
import { Worker } from './worker.entity';
import { WorkerService } from './worker.service';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('WorkerService', () => {
  let service: WorkerService;
  let workerRepository: MockRepository<Worker>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const mockRepositoryFactory = (): MockRepository<object> => ({
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerService,
        {
          provide: getRepositoryToken(Worker),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkerService>(WorkerService);
    workerRepository = module.get<MockRepository<Worker>>(getRepositoryToken(Worker));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addWorker', () => {
    const dto: AddWorkerDto = { name: 'Zika', password: 'password123' };
    const userId = 1;

    it('should successfully create a worker and hash their password', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('hashed_password');

      workerRepository.create!.mockImplementation((data) => ({ ...data }));
      workerRepository.save!.mockImplementation(
        async (w) => ({ workerId: 1, ...(w as object) }) as Worker,
      );

      const result = await service.addWorker(dto, userId);

      expect(CryptoUtil.hashPassword).toHaveBeenCalledWith(dto.password);
      expect(workerRepository.create).toHaveBeenCalledWith({ name: dto.name, userId });
      expect(result.workerId).toBe(1);
      expect(result.password).toBe('hashed_password');
    });

    it('should throw ConflictException if the worker name already exists', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('hashed_password');
      workerRepository.create!.mockImplementation((data) => data);

      const queryFailedError = new QueryFailedError('query', [], new Error());
      Object.assign(queryFailedError, { driverError: { code: 'ER_DUP_ENTRY' } });
      workerRepository.save!.mockRejectedValue(queryFailedError);

      await expect(service.addWorker(dto, userId)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for generic database failures', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('hashed_password');
      workerRepository.create!.mockImplementation((data) => data);
      workerRepository.save!.mockRejectedValue(new Error('DB fail'));

      await expect(service.addWorker(dto, userId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('editWorker', () => {
    const id = 1;
    const userId = 1;

    it('should throw NotFoundException if worker is not found', async () => {
      workerRepository.findOne!.mockResolvedValue(null);

      await expect(service.editWorker(id, {} as EditWorkerDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if current password verification fails', async () => {
      const existingWorker = {
        workerId: id,
        userId,
        name: 'Zika',
        password: 'hashed_password',
      } as Worker;
      const dto: EditWorkerDto = {
        password: 'wrong_password',
        newPassword: '',
      };

      workerRepository.findOne!.mockResolvedValue(existingWorker);
      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(false);

      await expect(service.editWorker(id, dto, userId)).rejects.toThrow(BadRequestException);
      expect(CryptoUtil.comparePassword).toHaveBeenCalledWith('wrong_password', 'hashed_password');
    });

    it('should successfully update worker details, hash new password and emit event', async () => {
      const existingWorker = {
        workerId: id,
        userId,
        name: 'Zika',
        password: 'old_hashed_password',
      } as Worker;
      const dto: EditWorkerDto = {
        password: 'correct_password',
        newName: 'Zika Novi',
        newPassword: 'new_password_123',
      };

      workerRepository.findOne!.mockResolvedValue(existingWorker);
      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('new_hashed_password');
      workerRepository.save!.mockImplementation(async (w) => w as Worker);

      const result = await service.editWorker(id, dto, userId);

      expect(CryptoUtil.comparePassword).toHaveBeenCalledWith(
        'correct_password',
        'old_hashed_password',
      );
      expect(CryptoUtil.hashPassword).toHaveBeenCalledWith('new_password_123');
      expect(result.name).toBe('Zika Novi');
      expect(result.password).toBe('new_hashed_password');
      expect(eventEmitter.emit).toHaveBeenCalledWith('worker.credentials.changed', { id });
    });
  });

  describe('findWorker', () => {
    const userId = 1;

    it('should return worker if name and password are valid', async () => {
      const mockWorker = {
        workerId: 5,
        name: 'Zika',
        password: 'hashed_password',
        userId,
      } as Worker;
      workerRepository.findOne!.mockResolvedValue(mockWorker);
      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);

      const result = await service.findWorker('Zika', 'pass', userId);

      expect(workerRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Zika', userId } });
      expect(result).toEqual(mockWorker);
    });

    it('should throw BadRequestException if password for found worker is incorrect', async () => {
      const mockWorker = {
        workerId: 5,
        name: 'Zika',
        password: 'hashed_password',
        userId,
      } as Worker;
      workerRepository.findOne!.mockResolvedValue(mockWorker);
      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(false);

      await expect(service.findWorker('Zika', 'wrong_pass', userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findWorkerById', () => {
    const id = 1;
    const userId = 1;

    it('should successfully return a worker if found by id', async () => {
      const mockWorker = { workerId: id, userId, name: 'Zika' } as Worker;
      workerRepository.findOne!.mockResolvedValue(mockWorker);

      const result = await service.findWorkerById(id, userId);
      expect(workerRepository.findOne).toHaveBeenCalledWith({ where: { workerId: id, userId } });
      expect(result).toEqual(mockWorker);
    });

    it('should throw NotFoundException if worker by id does not exist', async () => {
      workerRepository.findOne!.mockResolvedValue(null);
      await expect(service.findWorkerById(id, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWorkerByName', () => {
    it('should return worker or null when searching by name', async () => {
      const mockWorker = { name: 'Zika' } as Worker;
      workerRepository.findOne!.mockResolvedValue(mockWorker);

      const result = await service.getWorkerByName('Zika');
      expect(workerRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Zika' } });
      expect(result).toEqual(mockWorker);
    });
  });

  describe('deleteWorker', () => {
    it('should successfully remove worker if found and emit event', async () => {
      const mockWorker = { workerId: 1, userId: 1 } as Worker;
      workerRepository.findOne!.mockResolvedValue(mockWorker);
      workerRepository.remove!.mockResolvedValue(mockWorker);

      await expect(service.deleteWorker(1, 1)).resolves.not.toThrow();
      expect(eventEmitter.emit).toHaveBeenCalledWith('worker.deleted', { id: 1 });
      expect(workerRepository.remove).toHaveBeenCalledWith(mockWorker);
    });

    it('should throw NotFoundException if worker to delete is not found', async () => {
      workerRepository.findOne!.mockResolvedValue(null);
      await expect(service.deleteWorker(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('authenticateIdentity', () => {
    it('should return IAuthProfile mapping if worker exists', async () => {
      const mockWorker = {
        workerId: 10,
        name: 'Zika',
        password: 'hashed_password',
        userId: 2,
      } as Worker;

      workerRepository.findOne!.mockResolvedValue(mockWorker);

      const result = await service.authenticateIdentity('Zika');

      expect(result).toEqual({
        id: 10,
        identity: 'Zika',
        passwordHash: 'hashed_password',
        role: Role.WORKER,
        userId: 2,
      });
    });

    it('should return null if worker does not exist during authentication', async () => {
      workerRepository.findOne!.mockResolvedValue(null);

      const result = await service.authenticateIdentity('Nepostojeci');
      expect(result).toBeNull();
    });
  });
});
