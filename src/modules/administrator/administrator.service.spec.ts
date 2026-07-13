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

import { Administrator } from './administrator.entity';
import { AdministratorService } from './administrator.service';
import { AddAdministratorDto } from './dto/add-administrator.dto';
import { EditAdministratorDto } from './dto/edit-administrator.dto';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('AdministratorService', () => {
  let service: AdministratorService;
  let administratorRepository: MockRepository<Administrator>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const mockRepositoryFactory = (): MockRepository<object> => ({
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdministratorService,
        {
          provide: getRepositoryToken(Administrator),
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

    service = module.get<AdministratorService>(AdministratorService);
    administratorRepository = module.get<MockRepository<Administrator>>(
      getRepositoryToken(Administrator),
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addAdministrator', () => {
    const dto: AddAdministratorDto = { username: 'admin_marko', password: 'securePassword' };

    it('should successfully hash password and save new administrator', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('hashed_password');
      administratorRepository.save!.mockImplementation(
        async (admin) =>
          ({
            administratorId: 1,
            ...(admin as object),
          }) as Administrator,
      );

      const result = await service.addAdministrator(dto);

      expect(CryptoUtil.hashPassword).toHaveBeenCalledWith(dto.password);
      expect(administratorRepository.save).toHaveBeenCalled();
      expect(result.administratorId).toBe(1);
      expect(result.passwordHash).toBe('hashed_password');
    });

    it('should throw ConflictException if username is already taken', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('hashed_password');

      const queryFailedError = new QueryFailedError('query', [], new Error());
      Object.assign(queryFailedError, { driverError: { code: 'ER_DUP_ENTRY' } });
      administratorRepository.save!.mockRejectedValue(queryFailedError);

      await expect(service.addAdministrator(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for general database errors during creation', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('hashed_password');
      administratorRepository.save!.mockRejectedValue(new Error('Fatal DB crash'));

      await expect(service.addAdministrator(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('editAdmin', () => {
    const id = 1;
    const dto: EditAdministratorDto = {
      password: 'current_password',
      username: 'new_username',
      newPassword: 'new_password_123',
    };

    it('should throw NotFoundException if administrator does not exist', async () => {
      administratorRepository.findOne!.mockResolvedValue(null);

      await expect(service.editAdmin(id, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if current password verification fails', async () => {
      const existingAdmin = {
        administratorId: id,
        username: 'admin',
        passwordHash: 'old_hash',
      } as Administrator;
      administratorRepository.findOne!.mockResolvedValue(existingAdmin);
      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(false);

      await expect(service.editAdmin(id, dto)).rejects.toThrow(BadRequestException);
      expect(CryptoUtil.comparePassword).toHaveBeenCalledWith(dto.password, 'old_hash');
    });

    it('should successfully update data, hash new password and emit credentials changed event', async () => {
      const existingAdmin = {
        administratorId: id,
        username: 'admin',
        passwordHash: 'old_hash',
      } as Administrator;
      administratorRepository.findOne!.mockResolvedValue(existingAdmin);
      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('new_hashed_password');
      administratorRepository.save!.mockImplementation(async (admin) => admin as Administrator);

      const result = await service.editAdmin(id, dto);

      expect(CryptoUtil.comparePassword).toHaveBeenCalledWith(dto.password, 'old_hash');
      expect(CryptoUtil.hashPassword).toHaveBeenCalledWith(dto.newPassword);
      expect(eventEmitter.emit).toHaveBeenCalledWith('administrator.credentials.changed', {
        adminId: id,
      });
      expect(result.username).toBe('new_username');
      expect(result.passwordHash).toBe('new_hashed_password');
    });

    it('should throw ConflictException during update if username conflicts with another record', async () => {
      const existingAdmin = {
        administratorId: id,
        username: 'admin',
        passwordHash: 'old_hash',
      } as Administrator;
      administratorRepository.findOne!.mockResolvedValue(existingAdmin);
      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);

      const queryFailedError = new QueryFailedError('query', [], new Error());
      Object.assign(queryFailedError, { driverError: { code: 'ER_DUP_ENTRY' } });
      administratorRepository.save!.mockRejectedValue(queryFailedError);

      await expect(service.editAdmin(id, dto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException if database fails during update', async () => {
      const existingAdmin = {
        administratorId: id,
        username: 'admin',
        passwordHash: 'old_hash',
      } as Administrator;
      administratorRepository.findOne!.mockResolvedValue(existingAdmin);
      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);
      administratorRepository.save!.mockRejectedValue(new Error('Update failed'));

      await expect(service.editAdmin(id, dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteAdmin', () => {
    it('should throw NotFoundException if admin to delete is not found', async () => {
      administratorRepository.findOne!.mockResolvedValue(null);

      await expect(service.deleteAdmin(999)).rejects.toThrow(NotFoundException);
    });

    it('should successfully remove record and emit administrator.deleted event', async () => {
      const mockAdmin = { administratorId: 1, username: 'admin' } as Administrator;
      administratorRepository.findOne!.mockResolvedValue(mockAdmin);
      administratorRepository.remove!.mockResolvedValue(mockAdmin);

      await expect(service.deleteAdmin(1)).resolves.not.toThrow();
      expect(eventEmitter.emit).toHaveBeenCalledWith('administrator.deleted', { adminId: 1 });
      expect(administratorRepository.remove).toHaveBeenCalledWith(mockAdmin);
    });
  });

  describe('getAllAdmin', () => {
    it('should return all administrators', async () => {
      const mockAdmins = [{ administratorId: 1, username: 'admin1' }] as Administrator[];
      administratorRepository.find!.mockResolvedValue(mockAdmins);

      const result = await service.getAllAdmin();
      expect(result).toEqual(mockAdmins);
      expect(administratorRepository.find).toHaveBeenCalled();
    });
  });

  describe('getAdminByUsername', () => {
    it('should return administrator found by username', async () => {
      const mockAdmin = { administratorId: 1, username: 'admin1' } as Administrator;
      administratorRepository.findOne!.mockResolvedValue(mockAdmin);

      const result = await service.getAdminByUsername({ username: 'admin1' });
      expect(result).toEqual(mockAdmin);
      expect(administratorRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'admin1' },
      });
    });
  });

  describe('getAdminById', () => {
    it('should return administrator if found by id', async () => {
      const mockAdmin = { administratorId: 1, username: 'admin1' } as Administrator;
      administratorRepository.findOne!.mockResolvedValue(mockAdmin);

      const result = await service.getAdminById(1);
      expect(result).toEqual(mockAdmin);
    });

    it('should throw NotFoundException if search by id returns null', async () => {
      administratorRepository.findOne!.mockResolvedValue(null);

      await expect(service.getAdminById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('authenticateIdentity', () => {
    it('should return auth profile if administrator matches identity', async () => {
      const mockAdmin = {
        administratorId: 2,
        username: 'root',
        passwordHash: 'hash',
      } as Administrator;
      administratorRepository.findOne!.mockResolvedValue(mockAdmin);

      const result = await service.authenticateIdentity('root');

      expect(result).toEqual({
        id: 2,
        identity: 'root',
        passwordHash: 'hash',
        role: Role.ADMINISTRATOR,
      });
    });

    it('should return null if identity is not found', async () => {
      administratorRepository.findOne!.mockResolvedValue(null);

      const result = await service.authenticateIdentity('unknown');
      expect(result).toBeNull();
    });
  });
});
