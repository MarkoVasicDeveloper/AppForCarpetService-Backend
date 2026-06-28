import * as crypto from 'crypto';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtData } from 'dto/jwt/jwt.dto';
import { JwtRefreshData } from 'dto/jwt/jwt.refresh.dto';
import * as jwt from 'jsonwebtoken';
import { ApiResponse } from 'src/misc/api.restonse';
import { JwtSecret } from 'src/misc/jwt.secret';
import { LoginInfo } from 'src/misc/login.info';
import { AdministratorService } from 'src/modules/administrator/administrator.service';
import { UsernameAdministratorDto } from 'src/modules/administrator/DTO/username.administrator.dto';
import { UserAuthDto } from 'src/modules/user/DTO/user.auth.dto';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly userService: UserService,
  ) {}

  async loginAdministrator(
    data: UsernameAdministratorDto,
    ip: string,
    userAgent?: string,
  ): Promise<ApiResponse | LoginInfo> {
    const admin = await this.administratorService.getAdminByUsername(data);
    if (!admin)
      return new ApiResponse('error', -1001, 'Administrator with that username not found');

    const passwordHashString = crypto
      .createHash('sha512')
      .update(data.password)
      .digest('hex')
      .toUpperCase();
    if (passwordHashString !== admin.passwordHash)
      return new ApiResponse('error', -2002, 'Password is incorect');

    const jwtData = this.generateJwtData(
      admin.administratorId,
      admin.username,
      'administrator',
      ip,
      userAgent,
    );
    const token = jwt.sign(jwtData.toPlane(), JwtSecret);

    const jwtRefreshData = this.generateRefreshData(jwtData);
    const refreshToken = jwt.sign(jwtRefreshData.toPlane(), JwtSecret);

    await this.administratorService.createAdminToken(
      jwtData.Id,
      this.getDatabaseTime(this.getIsoFormat(jwtRefreshData.expire)),
      refreshToken,
    );

    return new LoginInfo(
      jwtData.Id,
      jwtData.identity,
      token,
      refreshToken,
      this.getIsoFormat(jwtRefreshData.expire),
    );
  }

  async loginUser(
    data: UserAuthDto,
    ip: string,
    userAgent?: string,
  ): Promise<ApiResponse | LoginInfo> {
    const user = await this.userService.getUserByEmail(data);
    if (!user) return new ApiResponse('error', -1001, 'User with that email not found');

    const passwordHashString = crypto
      .createHash('sha512')
      .update(data.password)
      .digest('hex')
      .toUpperCase();
    if (passwordHashString !== user.passwordHash)
      return new ApiResponse('error', -2002, 'Password is incorect');

    const jwtData = this.generateJwtData(user.userId, user.email, 'user', ip, userAgent);
    const token = jwt.sign(jwtData.toPlane(), JwtSecret);

    const jwtRefreshData = this.generateRefreshData(jwtData);
    const refreshToken = jwt.sign(jwtRefreshData.toPlane(), JwtSecret);

    await this.userService.createToken(
      jwtData.Id,
      this.getDatabaseTime(this.getIsoFormat(jwtRefreshData.expire)),
      refreshToken,
    );

    return new LoginInfo(
      jwtData.Id,
      jwtData.identity,
      token,
      refreshToken,
      this.getIsoFormat(jwtRefreshData.expire),
    );
  }

  async refreshUserToken(
    token: string,
    ip: string,
    userAgent?: string,
  ): Promise<LoginInfo | ApiResponse> {
    const userToken = await this.userService.getUserToken(token);
    if (!userToken) return new ApiResponse('error', -4001, 'Token not found');
    if (userToken.isValid === 0) return new ApiResponse('error', -4002, 'Token is not valid');

    if (new Date(userToken.expireAt).getTime() < new Date().getTime()) {
      return new ApiResponse('error', -4003, 'Token is expired');
    }

    const jwtDataObject = this.verifyAndValidateToken(token, ip, userAgent);
    const jwtData = this.generateJwtData(
      jwtDataObject.Id,
      jwtDataObject.identity,
      jwtDataObject.role,
      ip,
      userAgent,
    );
    const newToken = jwt.sign(jwtData.toPlane(), JwtSecret);

    return new LoginInfo(
      jwtData.Id,
      jwtData.identity,
      newToken,
      token,
      this.getIsoFormat(jwtDataObject.expire),
    );
  }

  async refreshAdminToken(
    token: string,
    ip: string,
    userAgent?: string,
  ): Promise<LoginInfo | ApiResponse> {
    const adminToken = await this.administratorService.getAdminToken(token);
    if (!adminToken) return new ApiResponse('error', -4001, 'Token not found');
    if (adminToken.isValid === 0) return new ApiResponse('error', -4002, 'Token is not valid');

    if (new Date(adminToken.expireAt).getTime() < new Date().getTime()) {
      return new ApiResponse('error', -4003, 'Token is expired');
    }

    const jwtDataObject = this.verifyAndValidateToken(token, ip, userAgent);
    const jwtData = this.generateJwtData(
      jwtDataObject.Id,
      jwtDataObject.identity,
      jwtDataObject.role,
      ip,
      userAgent,
    );
    const newToken = jwt.sign(jwtData.toPlane(), JwtSecret);

    return new LoginInfo(
      jwtData.Id,
      jwtData.identity,
      newToken,
      token,
      this.getIsoFormat(jwtDataObject.expire),
    );
  }

  // --- POMOĆNE METODE ---
  private generateJwtData(
    id: number,
    identity: string,
    role: string,
    ip: string,
    userAgent?: string,
  ): JwtData {
    const jwtData = new JwtData();
    jwtData.Id = id;
    jwtData.identity = identity;
    jwtData.expire = new Date().getTime() / 1000 + 60 * 5;
    jwtData.ipAddress = ip;
    jwtData.userAgent = userAgent;
    jwtData.role = role;
    return jwtData;
  }

  private generateRefreshData(jwtData: JwtData): JwtRefreshData {
    const refresh = new JwtRefreshData();
    refresh.Id = jwtData.Id;
    refresh.identity = jwtData.identity;
    refresh.expire = new Date().getTime() / 1000 + 60 * 60 * 24 * 31;
    refresh.ipAddress = jwtData.ipAddress;
    refresh.userAgent = jwtData.userAgent;
    refresh.role = jwtData.role;
    return refresh;
  }

  private verifyAndValidateToken(token: string, ip: string, userAgent?: string): JwtRefreshData {
    const jwtDataObject = jwt.verify(token, JwtSecret) as JwtRefreshData;
    if (!jwtDataObject) throw new HttpException('Token is incorect', HttpStatus.UNAUTHORIZED);
    if (ip !== jwtDataObject.ipAddress)
      throw new HttpException('Bad token found and ip', HttpStatus.UNAUTHORIZED);
    if (userAgent !== jwtDataObject.userAgent)
      throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
    return jwtDataObject;
  }

  private getIsoFormat(timestamp: number) {
    const date = new Date();
    date.setTime(timestamp * 1000);
    return date.toISOString();
  }

  private getDatabaseTime(isoFormatTime: string) {
    return isoFormatTime.substr(0, 19).replace('T', ' ');
  }
}
