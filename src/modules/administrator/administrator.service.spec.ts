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

  beforeEach(async () => {
    const mockRepositoryFactory = (): MockRepository<object> => ({
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdministratorService,
        {
          provide: getRepositoryToken(Administrator),
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<AdministratorService>(AdministratorService);
    administratorRepository = module.get<MockRepository<Administrator>>(
      getRepositoryToken(Administrator),
    );
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

    it('should successfully update data and hash new password if validation passes', async () => {
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
  });

  describe('deleteAdmin', () => {
    it('should throw NotFoundException if admin to delete is not found', async () => {
      administratorRepository.findOne!.mockResolvedValue(null);

      await expect(service.deleteAdmin(999)).rejects.toThrow(NotFoundException);
    });

    it('should successfully remove record if it exists in database', async () => {
      const mockAdmin = { administratorId: 1, username: 'admin' } as Administrator;
      administratorRepository.findOne!.mockResolvedValue(mockAdmin);
      administratorRepository.remove!.mockResolvedValue(mockAdmin);

      await expect(service.deleteAdmin(1)).resolves.not.toThrow();
      expect(administratorRepository.remove).toHaveBeenCalledWith(mockAdmin);
    });
  });

  describe('getAdminById', () => {
    it('should throw NotFoundException if search by id returns null', async () => {
      administratorRepository.findOne!.mockResolvedValue(null);

      await expect(service.getAdminById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
