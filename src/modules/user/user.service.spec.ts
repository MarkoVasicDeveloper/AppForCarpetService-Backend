import { ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError, ObjectLiteral } from 'typeorm';

import { CryptoUtil } from '../../shared/utils/crypto.util';
import { UserMailerService } from '../mailer/mailer.service';

import { AddUserDto } from './dto/add-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

type MockService<T> = {
  [P in keyof T]?: jest.Mock;
};

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository<User>;
  let mailerService: MockService<UserMailerService>;

  beforeEach(async () => {
    const mockRepositoryFactory = (): MockRepository<object> => ({
      create: jest.fn().mockImplementation((dto) => ({ ...dto })),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    });

    const mockMailerServiceFactory = (): MockService<UserMailerService> => ({
      sendWelcomeEmail: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: UserMailerService,
          useFactory: mockMailerServiceFactory,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    mailerService = module.get<MockService<UserMailerService>>(UserMailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addUser', () => {
    const dto: AddUserDto = {
      name: 'Marko',
      surname: 'Vasic',
      email: 'marko@example.com',
      city: 'Belgrade',
      address: 'Main St 1',
      phone: '+38161234567',
      password: 'password123',
    };

    it('should successfully create a user, hash password and trigger welcome email', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('mocked_hashed_password');
      userRepository.save!.mockResolvedValue({
        userId: 1,
        ...dto,
        passwordHash: 'mocked_hashed_password',
      } as unknown as User);
      mailerService.sendWelcomeEmail!.mockResolvedValue(undefined);

      const result = await service.addUser(dto);

      expect(CryptoUtil.hashPassword).toHaveBeenCalledWith(dto.password);
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(mailerService.sendWelcomeEmail).toHaveBeenCalledWith(dto.email);
      expect(result.userId).toBe(1);
      expect(result.passwordHash).toBe('mocked_hashed_password');
    });

    it('should throw ConflictException if database returns a duplicate entry error code', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('mocked_hashed_password');

      const queryFailedError = new QueryFailedError('query', [], new Error());
      Object.assign(queryFailedError, { driverError: { code: 'ER_DUP_ENTRY' } });
      userRepository.save!.mockRejectedValue(queryFailedError);

      await expect(service.addUser(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for generic database failures', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('mocked_hashed_password');
      userRepository.save!.mockRejectedValue(new Error('Connection failure'));

      await expect(service.addUser(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('editUser', () => {
    it('should successfully update and save user details', async () => {
      const existingUser = { userId: 1, name: 'OldName', email: 'm@example.com' } as User;
      const dto: EditUserDto = { name: 'NewName', city: 'Novi Sad' };

      userRepository.findOne!.mockResolvedValue(existingUser);
      userRepository.save!.mockImplementation(async (user) => user as User);

      const result = await service.editUser(1, dto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result.name).toBe('NewName');
      expect(result.city).toBe('Novi Sad');
    });
  });

  describe('getUserById', () => {
    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne!.mockResolvedValue(null);

      await expect(service.getUserById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should throw NotFoundException if user to delete does not exist', async () => {
      userRepository.delete!.mockResolvedValue({ affected: 0 });

      await expect(service.deleteUser(999)).rejects.toThrow(NotFoundException);
    });

    it('should successfully delete user if record exists', async () => {
      userRepository.delete!.mockResolvedValue({ affected: 1 });

      await expect(service.deleteUser(1)).resolves.not.toThrow();
      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
