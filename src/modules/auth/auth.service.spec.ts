import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { Role } from '../../shared/enums/role.enum';
import { CryptoUtil } from '../../shared/utils/crypto.util';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';
import {
  AUTH_PROVIDER_TOKEN,
  IAuthenticatableService,
  IAuthProfile,
} from './types/authenticatable.interface';

type MockService<T> = {
  [P in keyof T]?: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: MockService<JwtService>;
  let refreshTokenService: MockService<RefreshTokenService>;
  let mockAuthProvider: MockService<IAuthenticatableService>;

  beforeEach(async () => {
    const mockJwtServiceFactory = (): MockService<JwtService> => ({
      sign: jest.fn(),
      verify: jest.fn(),
    });
    const mockConfigServiceFactory = (): MockService<ConfigService> => ({
      get: jest.fn().mockReturnValue('mocked_secret'),
    });
    const mockRefreshTokenServiceFactory = (): MockService<RefreshTokenService> => ({
      findToken: jest.fn(),
      invalidateToken: jest.fn(),
      getRegistryOrThrow: jest.fn(),
      saveToken: jest.fn(),
    });

    mockAuthProvider = {
      authenticateIdentity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useFactory: mockJwtServiceFactory },
        { provide: ConfigService, useFactory: mockConfigServiceFactory },
        { provide: RefreshTokenService, useFactory: mockRefreshTokenServiceFactory },
        {
          provide: AUTH_PROVIDER_TOKEN,
          useValue: [mockAuthProvider],
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<MockService<JwtService>>(JwtService);
    refreshTokenService = module.get<MockService<RefreshTokenService>>(RefreshTokenService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = { identity: 'test@example.com', password: 'password123' };
    const ip = '127.0.0.1';
    const userAgent = 'Mozilla/5.0';

    it('should throw UnauthorizedException if identity matches no provider/account', async () => {
      mockAuthProvider.authenticateIdentity!.mockResolvedValue(null);

      await expect(service.login(loginDto, ip, userAgent)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password verification fails', async () => {
      const mockProfile: IAuthProfile = {
        id: 1,
        identity: 'test@example.com',
        passwordHash: 'wrong_hash',
        role: Role.USER,
        isVerified: true,
      };
      mockAuthProvider.authenticateIdentity!.mockResolvedValue(mockProfile);
      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(false);

      await expect(service.login(loginDto, ip, userAgent)).rejects.toThrow(
        new UnauthorizedException('Invalid identity or password'),
      );
    });

    it('should throw ForbiddenException if user is not verified', async () => {
      const mockProfile: IAuthProfile = {
        id: 1,
        identity: 'unverified@example.com',
        passwordHash: 'correct_hash',
        role: Role.USER,
        isVerified: false,
      };
      mockAuthProvider.authenticateIdentity!.mockResolvedValue(mockProfile);
      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);

      await expect(service.login(loginDto, ip, userAgent)).rejects.toThrow(ForbiddenException);
    });

    it('should login successfully and return LoginResponse when credentials match', async () => {
      const mockProfile: IAuthProfile = {
        id: 1,
        identity: 'test@example.com',
        passwordHash: 'correct_hash',
        role: Role.USER,
        isVerified: true,
        userId: 10,
      };
      mockAuthProvider.authenticateIdentity!.mockResolvedValue(mockProfile);
      jest.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);
      jwtService.sign!.mockReturnValue('mocked_token');

      const result = await service.login(loginDto, ip, userAgent);

      expect(mockAuthProvider.authenticateIdentity).toHaveBeenCalledWith(loginDto.identity);
      expect(CryptoUtil.comparePassword).toHaveBeenCalledWith(loginDto.password, 'correct_hash');
      expect(refreshTokenService.saveToken).toHaveBeenCalledWith(
        Role.USER,
        1,
        'mocked_token',
        expect.any(Date),
      );

      expect(result).toHaveProperty('token', 'mocked_token');
      expect(result).toHaveProperty('refreshToken', 'mocked_token');
      expect(result.id).toBe(1);
    });
  });

  describe('refresh', () => {
    const token = 'valid_refresh_token';
    const ip = '127.0.0.1';
    const userAgent = 'Mozilla/5.0';

    it('should throw UnauthorizedException if JWT verification signature fails', async () => {
      jwtService.verify!.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(service.refresh(token, ip, userAgent)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if IP or User-Agent do not match payload', async () => {
      jwtService.verify!.mockReturnValue({
        Id: 1,
        identity: 'user@test.com',
        role: Role.USER,
        ipAddress: '99.99.99.99',
        userAgent,
      });

      await expect(service.refresh(token, ip, userAgent)).rejects.toThrow(
        new UnauthorizedException('Security violation: IP or User-Agent mismatch'),
      );
    });

    it('should throw UnauthorizedException if token in database is missing or marked invalid', async () => {
      jwtService.verify!.mockReturnValue({
        Id: 1,
        identity: 'user@test.com',
        role: Role.USER,
        ipAddress: ip,
        userAgent,
      });
      refreshTokenService.findToken!.mockResolvedValue(null);

      await expect(service.refresh(token, ip, userAgent)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token in database is expired', async () => {
      jwtService.verify!.mockReturnValue({
        Id: 1,
        identity: 'user@test.com',
        role: Role.USER,
        ipAddress: ip,
        userAgent,
      });

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      refreshTokenService.findToken!.mockResolvedValue({
        isValid: 1,
        expireAt: pastDate,
      });

      await expect(service.refresh(token, ip, userAgent)).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully invalidate old token and generate new session', async () => {
      const payload = {
        Id: 10,
        identity: 'worker@test.com',
        role: Role.WORKER,
        ipAddress: ip,
        userAgent,
        userId: 100,
      };
      jwtService.verify!.mockReturnValue(payload);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const mockDbToken = {
        workerId: 10,
        userId: 100,
        isValid: 1,
        expireAt: futureDate,
      };

      refreshTokenService.findToken!.mockResolvedValue(mockDbToken);
      refreshTokenService.getRegistryOrThrow!.mockReturnValue({ idField: 'workerId' });
      jwtService.sign!.mockReturnValue('brand_new_token');

      const result = await service.refresh(token, ip, userAgent);

      expect(refreshTokenService.invalidateToken).toHaveBeenCalledWith(Role.WORKER, token);
      expect(refreshTokenService.saveToken).toHaveBeenCalledWith(
        Role.WORKER,
        10,
        'brand_new_token',
        expect.any(Date),
      );
      expect(result.token).toBe('brand_new_token');
    });
  });
});
