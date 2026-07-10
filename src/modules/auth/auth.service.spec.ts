import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

import { Role } from '../../shared/enums/role.enum';
import { CryptoUtil } from '../../shared/utils/crypto.util';
import { AdministratorService } from '../administrator/administrator.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { WorkerService } from '../worker/worker.service';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshAdministratorToken } from './entities/refresh-administrator-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshWorkerToken } from './entities/refresh-worker-token.entity';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

type MockService<T> = {
  [P in keyof T]?: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let administratorService: MockService<AdministratorService>;
  let userService: MockService<UserService>;
  let workerService: MockService<WorkerService>;
  let jwtService: MockService<JwtService>;
  let configService: MockService<ConfigService>;

  let refreshTokenRepo: MockRepository<RefreshToken>;
  let refreshWorkerTokenRepo: MockRepository<RefreshWorkerToken>;

  beforeEach(async () => {
    const mockRepoFactory = (): MockRepository<object> => ({
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    });

    const mockAdminServiceFactory = (): MockService<AdministratorService> => ({
      getAdminByUsername: jest.fn(),
    });
    const mockUserServiceFactory = (): MockService<UserService> => ({ getUserByEmail: jest.fn() });
    const mockWorkerServiceFactory = (): MockService<WorkerService> => ({
      getWorkerByName: jest.fn(),
    });
    const mockJwtServiceFactory = (): MockService<JwtService> => ({
      sign: jest.fn(),
      verify: jest.fn(),
    });
    const mockConfigServiceFactory = (): MockService<ConfigService> => ({ get: jest.fn() });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AdministratorService, useFactory: mockAdminServiceFactory },
        { provide: UserService, useFactory: mockUserServiceFactory },
        { provide: WorkerService, useFactory: mockWorkerServiceFactory },
        { provide: JwtService, useFactory: mockJwtServiceFactory },
        { provide: ConfigService, useFactory: mockConfigServiceFactory },
        { provide: getRepositoryToken(RefreshToken), useFactory: mockRepoFactory },
        { provide: getRepositoryToken(RefreshAdministratorToken), useFactory: mockRepoFactory },
        { provide: getRepositoryToken(RefreshWorkerToken), useFactory: mockRepoFactory },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    administratorService = module.get<MockService<AdministratorService>>(AdministratorService);
    userService = module.get<MockService<UserService>>(UserService);
    workerService = module.get<MockService<WorkerService>>(WorkerService);
    jwtService = module.get<MockService<JwtService>>(JwtService);
    configService = module.get<MockService<ConfigService>>(ConfigService);

    refreshTokenRepo = module.get<MockRepository<RefreshToken>>(getRepositoryToken(RefreshToken));

    refreshWorkerTokenRepo = module.get<MockRepository<RefreshWorkerToken>>(
      getRepositoryToken(RefreshWorkerToken),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = { identity: 'test_identity', password: 'password123' };
    const ip = '127.0.0.1';
    const userAgent = 'Mozilla';

    it('should throw UnauthorizedException if identity matches no account', async () => {
      administratorService.getAdminByUsername!.mockResolvedValue(null);
      userService.getUserByEmail!.mockResolvedValue(null);
      workerService.getWorkerByName!.mockResolvedValue(null);

      await expect(service.login(loginDto, ip, userAgent)).rejects.toThrow(UnauthorizedException);
    });

    it('should login successfully as User when valid credentials are given', async () => {
      const mockUser = { userId: 5, email: 'user@test.com', passwordHash: 'hashed' } as User;
      administratorService.getAdminByUsername!.mockResolvedValue(null);
      userService.getUserByEmail!.mockResolvedValue(mockUser);

      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);
      configService.get!.mockReturnValue('secret');
      jwtService.sign!.mockReturnValue('mocked_jwt_token');
      refreshTokenRepo.save!.mockResolvedValue({} as RefreshToken);

      const result = await service.login(loginDto, ip, userAgent);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(loginDto.identity);
      expect(CryptoUtil.comparePassword).toHaveBeenCalledWith(loginDto.password, 'hashed');
      expect(result.id).toBe(5);
      expect(result.token).toBe('mocked_jwt_token');
    });
  });

  describe('refresh', () => {
    const token = 'valid_refresh_token';
    const ip = '127.0.0.1';
    const userAgent = 'Mozilla';

    it('should throw UnauthorizedException if token verification fails', async () => {
      jwtService.verify!.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(service.refresh(token, ip, userAgent)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if IP or User-Agent do not match payload', async () => {
      jwtService.verify!.mockReturnValue({
        Id: 1,
        identity: 'admin',
        role: Role.ADMINISTRATOR,
        ipAddress: '8.8.8.8',
        userAgent,
      });

      await expect(service.refresh(token, ip, userAgent)).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully refresh session for Worker when db token is valid', async () => {
      const payload = {
        Id: 10,
        identity: 'worker1',
        role: Role.WORKER,
        ipAddress: ip,
        userAgent,
        userId: 1,
      };
      jwtService.verify!.mockReturnValue(payload);
      configService.get!.mockReturnValue('secret');
      jwtService.sign!.mockReturnValue('new_token');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const mockDbToken = { isValid: 1, expireAt: futureDate } as RefreshWorkerToken;
      refreshWorkerTokenRepo.findOne!.mockResolvedValue(mockDbToken);
      refreshWorkerTokenRepo.save!.mockResolvedValue(mockDbToken);
      refreshWorkerTokenRepo.create!.mockImplementation((data) => data);

      const result = await service.refresh(token, ip, userAgent);

      expect(refreshWorkerTokenRepo.findOne).toHaveBeenCalledWith({
        where: { refreshWorkerToken: token },
      });
      expect(mockDbToken.isValid).toBe(0);
      expect(result.token).toBe('new_token');
    });

    it('should throw UnauthorizedException if database token is expired', async () => {
      const payload = { Id: 2, identity: 'user', role: Role.USER, ipAddress: ip, userAgent };
      jwtService.verify!.mockReturnValue(payload);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);

      const mockDbToken = { isValid: 1, expireAt: pastDate } as RefreshToken;
      refreshTokenRepo.findOne!.mockResolvedValue(mockDbToken);

      await expect(service.refresh(token, ip, userAgent)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Token Invalidation operations', () => {
    it('should update all user tokens to invalid', async () => {
      refreshTokenRepo.update!.mockResolvedValue({ affected: 3 });

      await service.invalidateAllUserTokens(5);

      expect(refreshTokenRepo.update).toHaveBeenCalledWith(
        { userId: 5, isValid: 1 },
        { isValid: 0 },
      );
    });
  });
});
