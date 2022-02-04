/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */

import { InjectRepository } from "@nestjs/typeorm";
import { AddAdministratorDto } from "dto/administrator/add.administrator.dto";
import { Administrator } from "entities/Administrator";
import { ApiResponse } from "src/misc/api.restonse";
import { Repository } from "typeorm";
import * as crypto from "crypto";
import { EditAdministratorDto } from "dto/administrator/edit.administrator.dto";
import { DeleteAdministratorDto } from "dto/administrator/delete.administrator.dto";
import { UsernameAdministratorDto } from "dto/administrator/username.administrator.dto";
import { RefreshAdministratorToken } from "entities/RefreshAdministratorToken";

export class AdministratorService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administratorService: Repository<Administrator>,
    @InjectRepository(RefreshAdministratorToken)
    private readonly refreshAdministratorToken: Repository<RefreshAdministratorToken>
  ) {}

  async addAdministrator(
    data: AddAdministratorDto
  ): Promise<Administrator | ApiResponse> {
    try {
      const passwordString = this.passwordCrypto(data.password);

      const admin = new Administrator();
      admin.username = data.username;
      admin.passwordHash = passwordString;

      const savedAdmin = await this.administratorService.save(admin);

      return savedAdmin;
    } catch (error) {
      return new ApiResponse(
        "error",
        -1001,
        "Administrator not saved. Probably username is taken"
      );
    }
  }

  async editAdmin(
    data: EditAdministratorDto
  ): Promise<Administrator | ApiResponse> {
    const admin = await this.administratorService.findOne({
      where: {
        username: data.username,
      },
    });

    if (!admin) {
      return new ApiResponse(
        "error",
        -1002,
        "Administrator with that username not exist"
      );
    }

    const oldPassword = this.passwordCrypto(data.password);

    if (oldPassword !== admin.passwordHash) {
      return new ApiResponse("error", -1003, "Password incorect");
    }

    const newPassword = this.passwordCrypto(data.newPassword);

    admin.passwordHash = newPassword;

    const savedAdmin = await this.administratorService.save(admin);

    return savedAdmin;
  }

  private passwordCrypto(password: string) {
    const passwordString = crypto.createHash("sha512");
    passwordString.update(password);
    const passwordHash = passwordString
      .digest("hex")
      .toString()
      .toLocaleUpperCase();
    return passwordHash;
  }

  async deleteAdmin(
    data: DeleteAdministratorDto
  ): Promise<Administrator | ApiResponse> {
    const admin = await this.administratorService.findOne({
      where: {
        username: data.username,
      },
    });

    if (!admin) {
      return new ApiResponse(
        "error",
        -1002,
        "Administrator with that username not exist"
      );
    }

    const deleteAdmin = await this.administratorService.remove(admin);

    return deleteAdmin;
  }

  async getAllAdmin(): Promise<Administrator[]> {
    return await this.administratorService.find();
  }

  async getAdminByUsername(
    data: UsernameAdministratorDto
  ): Promise<Administrator> {
    const admin = await this.administratorService.findOne({
      where: {
        username: data.username,
      },
    });

    if (!admin) {
      return null;
    }

    return admin;
  }

  async getAdminById(id: number): Promise<Administrator> {
    const admin = await this.administratorService.findOne(id);

    if (!admin) {
      return null;
    }

    return admin;
  }

  async createAdminToken(
    administratorId: number,
    expireAt: string,
    refreshAdminToken: string
  ) {
    const adminRefreshToken = new RefreshAdministratorToken();
    adminRefreshToken.administratorId = administratorId;
    adminRefreshToken.refreshAdministratorToken = refreshAdminToken;
    adminRefreshToken.expireAt = expireAt as any;

    return await this.refreshAdministratorToken.save(adminRefreshToken);
  }

  async getAdminToken(token: string): Promise<RefreshAdministratorToken> {
    const admin = await this.refreshAdministratorToken.findOne({
      refreshAdministratorToken: token,
    });

    return admin;
  }

  async invalidateToken(
    token: string
  ): Promise<RefreshAdministratorToken | ApiResponse> {
    const adminToken = await this.refreshAdministratorToken.findOne({
      refreshAdministratorToken: token,
    });

    if (!adminToken) {
      return new ApiResponse("error", -3001, "Token not found");
    }

    adminToken.isValid = 0;

    await this.refreshAdministratorToken.save(adminToken);

    return await this.getAdminToken(token);
  }

  async invalidateAdminTokens(
    administratorId: number
  ): Promise<(RefreshAdministratorToken | ApiResponse)[]> {
    const adminTokens = await this.refreshAdministratorToken.find({
      administratorId: administratorId,
    });

    const results = [];

    for (const adminToken of adminTokens) {
      results.push(this.invalidateToken(adminToken.refreshAdministratorToken));
    }

    return results;
  }
}
