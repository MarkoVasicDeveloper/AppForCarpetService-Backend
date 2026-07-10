import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError, ObjectLiteral } from 'typeorm';

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
      ],
    }).compile();

    service = module.get<WorkerService>(WorkerService);
    workerRepository = module.get<MockRepository<Worker>>(getRepositoryToken(Worker));
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

    it('should successfully update worker details and hash new password if provided', async () => {
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

  describe('deleteWorker', () => {
    it('should successfully remove worker if found', async () => {
      const mockWorker = { workerId: 1, userId: 1 } as Worker;
      workerRepository.findOne!.mockResolvedValue(mockWorker);
      workerRepository.remove!.mockResolvedValue(mockWorker);

      await expect(service.deleteWorker(1, 1)).resolves.not.toThrow();
      expect(workerRepository.remove).toHaveBeenCalledWith(mockWorker);
    });
  });
});
