/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { ApiResponse } from "src/misc/api.restonse";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as crypto from "crypto";
import { LoginInfo } from "src/misc/login.info";
import { JwtData } from "dto/jwt/jwt.dto";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import { JwtSecret } from "src/misc/jwt.secret";
import { UsernameAdministratorDto } from "dto/administrator/username.administrator.dto";
import { UserService } from "src/services/user/user.service";
import { UserAuthDto } from "dto/user/user.auth.dto";
import { JwtRefreshData } from "dto/jwt/jwt.refresh.dto";
import { UserTokenDto } from "dto/refreshToken/user.token.dto";
import { AdminTokenDto } from "dto/administrator/admin.token.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly userService: UserService
  ) {}

  @Post("administrator")
  async doLogin(
    @Body() data: UsernameAdministratorDto,
    @Req() req: Request
  ): Promise<ApiResponse | LoginInfo> {
    const admin = await this.administratorService.getAdminByUsername(data);

    if (!admin) {
      return new ApiResponse(
        "error",
        -1001,
        "Administrator with that username not found"
      );
    }

    const passwordHash = crypto.createHash("sha512");
    passwordHash.update(data.password);
    const passwordHashString = passwordHash
      .digest("hex")
      .toString()
      .toUpperCase();

    if (passwordHashString !== admin.passwordHash) {
      return new ApiResponse("error", -2002, "Password is incorect");
    }

    const jwtData = new JwtData();
    jwtData.Id = admin.administratorId;
    jwtData.identity = admin.username;
    jwtData.expire = this.getDatePlus(60 * 5);
    jwtData.ipAddress = req.ip;
    jwtData.userAgent = req.headers["user-agent"];
    jwtData.role = "administrator";

    const token = jwt.sign(jwtData.toPlane(), JwtSecret);

    const jwtRefreshData = new JwtRefreshData();
    jwtRefreshData.Id = jwtData.Id;
    jwtRefreshData.identity = jwtData.identity;
    jwtRefreshData.expire = this.getDatePlus(60 * 60 * 24 * 31);
    jwtRefreshData.ipAddress = jwtData.ipAddress;
    jwtRefreshData.userAgent = jwtData.userAgent;
    jwtRefreshData.role = jwtData.role;

    const refreshToken = jwt.sign(jwtRefreshData.toPlane(), JwtSecret);

    await this.administratorService.createAdminToken(
      jwtData.Id,
      this.getDatabaseTime(this.getIsoFormat(jwtRefreshData.expire)),
      refreshToken
    );

    return new LoginInfo(
      jwtData.Id,
      jwtData.identity,
      token,
      refreshToken,
      this.getIsoFormat(jwtRefreshData.expire)
    );
  }

  @Post("user")
  async doLoginUser(
    @Body() data: UserAuthDto,
    @Req() req: Request
  ): Promise<ApiResponse | LoginInfo> {
    const user = await this.userService.getUserByEmail(data);

    if (!user) {
      return new ApiResponse("error", -1001, "User with that email not found");
    }

    const passwordHash = crypto.createHash("sha512");
    passwordHash.update(data.password);
    const passwordHashString = passwordHash
      .digest("hex")
      .toString()
      .toUpperCase();

    if (passwordHashString !== user.passwordHash) {
      return new ApiResponse("error", -2002, "Password is incorect");
    }

    const jwtData = new JwtData();
    jwtData.Id = user.userId;
    jwtData.identity = user.email;
    jwtData.expire = this.getDatePlus(60 * 5);
    jwtData.ipAddress = req.ip;
    jwtData.userAgent = req.headers["user-agent"];
    jwtData.role = "user";

    const token = jwt.sign(jwtData.toPlane(), JwtSecret);

    const jwtRefreshData = new JwtRefreshData();
    jwtRefreshData.Id = jwtData.Id;
    jwtRefreshData.identity = jwtData.identity;
    jwtRefreshData.expire = this.getDatePlus(60 * 60 * 24 * 31);
    jwtRefreshData.ipAddress = jwtData.ipAddress;
    jwtRefreshData.userAgent = jwtData.userAgent;
    jwtRefreshData.role = jwtData.role;

    const refreshToken = jwt.sign(jwtRefreshData.toPlane(), JwtSecret);

    await this.userService.createToken(
      jwtData.Id,
      this.getDatabaseTime(this.getIsoFormat(jwtRefreshData.expire)),
      refreshToken
    );

    return new LoginInfo(
      jwtData.Id,
      jwtData.identity,
      token,
      refreshToken,
      this.getIsoFormat(jwtRefreshData.expire)
    );
  }

  @Post("user/refresh")
  async userTokenRefresh(
    @Req() req: Request,
    @Body() data: UserTokenDto
  ): Promise<LoginInfo | ApiResponse> {
    const userToken = await this.userService.getUserToken(data.token);

    if (!userToken) {
      return new ApiResponse("error", -4001, "Token not found");
    }

    if (userToken.isValid === 0) {
      return new ApiResponse("error", -4002, "Token is not valid");
    }

    const now = new Date();
    const dateExpired = new Date(userToken.expireAt);

    if (dateExpired.getTime() < now.getTime()) {
      return new ApiResponse("error", -4003, "Token is expired");
    }

    const jwtDataObject: JwtRefreshData = jwt.verify(
      data.token,
      JwtSecret
    ) as any;

    if (!jwtDataObject) {
      throw new HttpException("Token is incorect", HttpStatus.UNAUTHORIZED);
    }

    if (req.ip !== jwtDataObject.ipAddress) {
      throw new HttpException(
        "Bad token found and ip",
        HttpStatus.UNAUTHORIZED
      );
    }

    if (req.headers["user-agent"] !== jwtDataObject.userAgent) {
      throw new HttpException("Bad token found", HttpStatus.UNAUTHORIZED);
    }

    const jwtData = new JwtData();
    jwtData.Id = jwtDataObject.Id;
    jwtData.identity = jwtDataObject.identity;
    jwtData.expire = this.getDatePlus(60 * 5);
    jwtData.ipAddress = jwtDataObject.ipAddress;
    jwtData.userAgent = jwtDataObject.userAgent;
    jwtData.role = jwtDataObject.role;

    const token = jwt.sign(jwtData.toPlane(), JwtSecret);

    return new LoginInfo(
      jwtData.Id,
      jwtData.identity,
      token,
      data.token,
      this.getIsoFormat(jwtDataObject.expire)
    );
  }

  @Post("administrator/refresh")
  async adminTokenRefresh(
    @Req() req: Request,
    @Body() data: AdminTokenDto
  ): Promise<LoginInfo | ApiResponse> {
    const adminToken = await this.administratorService.getAdminToken(
      data.token
    );

    if (!adminToken) {
      return new ApiResponse("error", -4001, "Token not found");
    }

    if (adminToken.isValid === 0) {
      return new ApiResponse("error", -4002, "Token is not valid");
    }

    const now = new Date();
    const dateExpired = new Date(adminToken.expireAt);

    if (dateExpired.getTime() < now.getTime()) {
      return new ApiResponse("error", -4003, "Token is expired");
    }

    const jwtDataObject: JwtRefreshData = jwt.verify(
      data.token,
      JwtSecret
    ) as any;

    if (!jwtDataObject) {
      throw new HttpException("Token is incorect", HttpStatus.UNAUTHORIZED);
    }

    if (req.ip !== jwtDataObject.ipAddress) {
      throw new HttpException(
        "Bad token found and ip",
        HttpStatus.UNAUTHORIZED
      );
    }

    if (req.headers["user-agent"] !== jwtDataObject.userAgent) {
      throw new HttpException("Bad token found", HttpStatus.UNAUTHORIZED);
    }

    const jwtData = new JwtData();
    jwtData.Id = jwtDataObject.Id;
    jwtData.identity = jwtDataObject.identity;
    jwtData.expire = this.getDatePlus(60 * 5);
    jwtData.ipAddress = jwtDataObject.ipAddress;
    jwtData.userAgent = jwtDataObject.userAgent;
    jwtData.role = jwtDataObject.role;

    const token = jwt.sign(jwtData.toPlane(), JwtSecret);

    return new LoginInfo(
      jwtData.Id,
      jwtData.identity,
      token,
      data.token,
      this.getIsoFormat(jwtDataObject.expire)
    );
  }

  private getDatePlus(numberOfSeconds: number) {
    return new Date().getTime() / 1000 + numberOfSeconds;
  }

  private getIsoFormat(timestamp: number) {
    const date = new Date();
    date.setTime(timestamp * 1000);
    return date.toISOString();
  }

  private getDatabaseTime(isoFormatTime: string) {
    return isoFormatTime.substr(0, 19).replace("T", " ");
  }
}
