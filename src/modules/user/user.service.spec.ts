import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError, ObjectLiteral } from 'typeorm';

import { Role } from '../../shared/enums/role.enum';
import { CryptoUtil } from '../../shared/utils/crypto.util';

import { AddUserDto } from './dto/add-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository<User>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const mockRepositoryFactory = (): MockRepository<object> => ({
      create: jest.fn().mockImplementation((dto) => ({ ...dto })),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
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

    service = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

    it('should successfully create a user, hash password and emit user.registered event', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('mocked_hashed_password');

      const mockSavedUser = {
        userId: 1,
        ...dto,
        passwordHash: 'mocked_hashed_password',
        verificationToken: 'some-random-uuid',
        isVerified: false,
      };

      userRepository.save!.mockResolvedValue(mockSavedUser);

      const result = await service.addUser(dto);

      expect(CryptoUtil.hashPassword).toHaveBeenCalledWith(dto.password);
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();

      expect(eventEmitter.emit).toHaveBeenCalledWith('user.registered', {
        email: mockSavedUser.email,
        name: 'Marko Vasic',
        token: mockSavedUser.verificationToken,
      });

      expect(result.userId).toBe(1);
      expect(result.passwordHash).toBe('mocked_hashed_password');
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('mocked_hashed_password');

      const queryFailedError = new QueryFailedError('query', [], new Error());
      Object.assign(queryFailedError, { driverError: { code: 'ER_DUP_ENTRY' } });
      userRepository.save!.mockRejectedValue(queryFailedError);

      await expect(service.addUser(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for database crashes', async () => {
      jest.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('mocked_hashed_password');
      userRepository.save!.mockRejectedValue(new Error('DB crash'));

      await expect(service.addUser(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('editUser', () => {
    it('should update user details and emit user.credentials.changed event', async () => {
      const existingUser = { userId: 1, name: 'OldName', email: 'm@example.com' } as User;
      const dto: EditUserDto = { name: 'NewName', city: 'Novi Sad' };

      userRepository.findOne!.mockResolvedValue(existingUser);
      userRepository.save!.mockImplementation(async (user) => user as User);

      const result = await service.editUser(1, dto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(eventEmitter.emit).toHaveBeenCalledWith('user.credentials.changed', { userId: 1 });
      expect(result.name).toBe('NewName');
      expect(result.city).toBe('Novi Sad');
    });

    it('should throw NotFoundException if user to edit does not exist', async () => {
      userRepository.findOne!.mockResolvedValue(null);
      await expect(service.editUser(999, { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.delete!.mockResolvedValue({ affected: 0 });

      await expect(service.deleteUser(999)).rejects.toThrow(NotFoundException);
    });

    it('should successfully delete user and emit user.deleted event', async () => {
      userRepository.delete!.mockResolvedValue({ affected: 1 });

      await expect(service.deleteUser(1)).resolves.not.toThrow();
      expect(eventEmitter.emit).toHaveBeenCalledWith('user.deleted', { userId: 1 });
      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const mockUser = { userId: 1, name: 'Marko' } as User;
      userRepository.findOne!.mockResolvedValue(mockUser);

      const result = await service.getUserById(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne!.mockResolvedValue(null);
      await expect(service.getUserById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUser', () => {
    it('should return a list of users', async () => {
      const mockUsers = [
        { userId: 1, name: 'Marko' },
        { userId: 2, name: 'Nikola' },
      ] as User[];
      userRepository.find!.mockResolvedValue(mockUsers);

      const result = await service.getAllUser();
      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user or null by email', async () => {
      const mockUser = { userId: 1, email: 'test@example.com' } as User;
      userRepository.findOne!.mockResolvedValue(mockUser);

      const result = await service.getUserByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('verifyAccount', () => {
    it('should throw BadRequestException if token is missing', async () => {
      await expect(service.verifyAccount('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is invalid', async () => {
      userRepository.findOne!.mockResolvedValue(null);
      await expect(service.verifyAccount('bad-token')).rejects.toThrow(BadRequestException);
    });

    it('should successfully verify account, nullify token and save', async () => {
      const mockUser = { userId: 1, isVerified: false, verificationToken: 'valid-token' } as User;
      userRepository.findOne!.mockResolvedValue(mockUser);
      userRepository.save!.mockImplementation(async (u) => u as User);

      const result = await service.verifyAccount('valid-token');

      expect(mockUser.isVerified).toBe(true);
      expect(mockUser.verificationToken).toBeNull();
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result.success).toBe(true);
    });
  });

  describe('authenticateIdentity', () => {
    it('should return auth profile if user is found by email', async () => {
      const mockUser = {
        userId: 5,
        email: 'marko@example.com',
        passwordHash: 'hashed_pass',
        isVerified: true,
      } as User;

      userRepository.findOne!.mockResolvedValue(mockUser);

      const result = await service.authenticateIdentity('marko@example.com');

      expect(result).toEqual({
        id: 5,
        identity: 'marko@example.com',
        passwordHash: 'hashed_pass',
        role: Role.USER,
        isVerified: true,
      });
    });

    it('should return null if user is not found during authentication', async () => {
      userRepository.findOne!.mockResolvedValue(null);

      const result = await service.authenticateIdentity('nobody@example.com');
      expect(result).toBeNull();
    });
  });
});
