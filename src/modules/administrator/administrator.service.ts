import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'src/modules/administrator/administrator.entity';
import { AddAdministratorDto } from 'src/modules/administrator/dto/add-administrator.dto';
import { EditAdministratorDto } from 'src/modules/administrator/dto/edit-administrator.dto';
import { RefreshAdministratorToken } from 'src/modules/auth/entities/refresh-administrator-token.entity';
import { CryptoUtil } from 'src/shared/utils/crypto.util';
import { Repository } from 'typeorm';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,
    @InjectRepository(RefreshAdministratorToken)
    private readonly refreshAdministratorTokenRepository: Repository<RefreshAdministratorToken>,
  ) {}

  async addAdministrator(data: AddAdministratorDto): Promise<Administrator> {
    const existing = await this.administratorRepository.findOne({
      where: { username: data.username },
    });

    if (existing) {
      throw new ConflictException('Administrator with that username already exists');
    }

    const admin = new Administrator();
    admin.username = data.username;
    admin.passwordHash = CryptoUtil.hashPassword(data.password);

    return await this.administratorRepository.save(admin);
  }

  async editAdmin(id: number, data: EditAdministratorDto): Promise<Administrator> {
    const admin = await this.administratorRepository.findOne({
      where: { administratorId: id },
    });

    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    const oldPasswordHash = CryptoUtil.hashPassword(data.password);
    if (oldPasswordHash !== admin.passwordHash) {
      throw new BadRequestException('Incorrect current password');
    }

    if (data.username && data.username !== admin.username) {
      const usernameTaken = await this.administratorRepository.findOne({
        where: { username: data.username },
      });

      if (usernameTaken) {
        throw new ConflictException('This username is already taken');
      }

      admin.username = data.username;
    }

    if (data.newPassword) {
      admin.passwordHash = CryptoUtil.hashPassword(data.newPassword);
    }

    const savedAdmin = await this.administratorRepository.save(admin);

    if (data.username || data.newPassword) {
      await this.invalidateAdminTokens(id);
    }

    return savedAdmin;
  }

  async deleteAdmin(id: number): Promise<void> {
    const admin = await this.administratorRepository.findOne({
      where: { administratorId: id },
    });

    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    await this.administratorRepository.remove(admin);
  }

  async getAllAdmin(): Promise<Administrator[]> {
    return await this.administratorRepository.find();
  }

  async getAdminByUsername(data: { username: string }): Promise<Administrator> {
    const admin = await this.administratorRepository.findOne({
      where: { username: data.username },
    });

    if (!admin) {
      throw new NotFoundException(`Administrator with username ${data.username} not found`);
    }

    return admin;
  }

  async getAdminById(id: number): Promise<Administrator> {
    const admin = await this.administratorRepository.findOne({
      where: { administratorId: id },
    });

    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    return admin;
  }

  async createAdminToken(
    administratorId: number,
    expireAt: string,
    refreshAdminToken: string,
  ): Promise<RefreshAdministratorToken> {
    const adminRefreshToken = new RefreshAdministratorToken();
    adminRefreshToken.administratorId = administratorId;
    adminRefreshToken.refreshAdministratorToken = refreshAdminToken;
    adminRefreshToken.expireAt = new Date(expireAt);

    return await this.refreshAdministratorTokenRepository.save(adminRefreshToken);
  }

  async getAdminToken(token: string): Promise<RefreshAdministratorToken> {
    const adminToken = await this.refreshAdministratorTokenRepository.findOne({
      where: { refreshAdministratorToken: token },
    });

    if (!adminToken) {
      throw new NotFoundException('Refresh token not found');
    }

    return adminToken;
  }

  async invalidateToken(token: string): Promise<void> {
    const adminToken = await this.getAdminToken(token);
    adminToken.isValid = 0;
    await this.refreshAdministratorTokenRepository.save(adminToken);
  }

  async invalidateAdminTokens(administratorId: number): Promise<void> {
    await this.refreshAdministratorTokenRepository.update(
      { administratorId: administratorId, isValid: 1 },
      { isValid: 0 },
    );
  }
}
