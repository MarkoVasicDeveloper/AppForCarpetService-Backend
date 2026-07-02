import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'src/modules/administrator/administrator.entity';
import { AddAdministratorDto } from 'src/modules/administrator/dto/add-administrator.dto';
import { DeleteAdministratorDto } from 'src/modules/administrator/dto/delete-administrator.dto';
import { EditAdministratorDto } from 'src/modules/administrator/dto/edit-administrator.dto';
import { RefreshAdministratorToken } from 'src/modules/auth/entities/refresh-administrator-token.entity';
import { UsernameAdministratorDto } from 'src/modules/auth/dto/username-administrator.dto';
import { ApiResponse } from 'src/shared/response/api-response';
import { Repository } from 'typeorm';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administratorService: Repository<Administrator>,
    @InjectRepository(RefreshAdministratorToken)
    private readonly refreshAdministratorToken: Repository<RefreshAdministratorToken>,
  ) {}

  async addAdministrator(data: AddAdministratorDto): Promise<Administrator | ApiResponse> {
    try {
      const passwordString = this.passwordCrypto(data.password);

      const admin = new Administrator();
      admin.username = data.username;
      admin.passwordHash = passwordString;

      return await this.administratorService.save(admin);
    } catch (error) {
      return new ApiResponse('error', -1001, 'Administrator not saved. Probably username is taken');
    }
  }

  async editAdmin(data: EditAdministratorDto): Promise<Administrator | ApiResponse> {
    const admin = await this.administratorService.findOne({
      where: { username: data.username },
    });

    if (!admin) {
      return new ApiResponse('error', -1002, 'Administrator with that username not exist');
    }

    const oldPassword = this.passwordCrypto(data.password);
    if (oldPassword !== admin.passwordHash) {
      return new ApiResponse('error', -1003, 'Password incorect');
    }

    admin.passwordHash = this.passwordCrypto(data.newPassword);
    return await this.administratorService.save(admin);
  }

  private passwordCrypto(password: string): string {
    const passwordString = crypto.createHash('sha512');
    passwordString.update(password);
    return passwordString.digest('hex').toString().toLocaleUpperCase();
  }

  async deleteAdmin(data: DeleteAdministratorDto): Promise<Administrator | ApiResponse> {
    const admin = await this.administratorService.findOne({
      where: { username: data.username },
    });

    if (!admin) {
      return new ApiResponse('error', -1002, 'Administrator with that username not exist');
    }

    return await this.administratorService.remove(admin);
  }

  async getAllAdmin(): Promise<Administrator[]> {
    return await this.administratorService.find();
  }

  async getAdminByUsername(data: UsernameAdministratorDto): Promise<Administrator | undefined> {
    const admin = await this.administratorService.findOne({
      where: { username: data.username },
    });
    return admin ?? undefined;
  }

  async getAdminById(id: number): Promise<Administrator | undefined> {
    const admin = await this.administratorService.findOne({
      where: { administratorId: id },
    });
    return admin ?? undefined;
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

    return await this.refreshAdministratorToken.save(adminRefreshToken);
  }

  async getAdminToken(token: string): Promise<RefreshAdministratorToken | null> {
    return await this.refreshAdministratorToken.findOne({
      where: { refreshAdministratorToken: token },
    });
  }

  async invalidateToken(token: string): Promise<RefreshAdministratorToken | ApiResponse> {
    const adminToken = await this.getAdminToken(token);

    if (!adminToken || adminToken instanceof ApiResponse) {
      return new ApiResponse('error', -3001, 'Token not found');
    }

    adminToken.isValid = 0;
    await this.refreshAdministratorToken.save(adminToken);

    return adminToken;
  }

  async invalidateAdminTokens(
    administratorId: number,
  ): Promise<(RefreshAdministratorToken | ApiResponse)[]> {
    const adminTokens = await this.refreshAdministratorToken.find({
      where: { administratorId: administratorId },
    });

    const promises = adminTokens.map((adminToken) =>
      this.invalidateToken(adminToken.refreshAdministratorToken),
    );

    return await Promise.all(promises);
  }
}
