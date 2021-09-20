/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiResponse } from "misc/api.restonse";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as crypto from 'crypto';
import { LoginInfo } from "misc/login.info";
import { JwtData } from "dto/jwt/jwt.dto";
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtSecret } from "misc/jwt.secret";
import { UsernameAdministratorDto } from "dto/administrator/username.administrator.dto";
import { UserService } from "src/services/user/user.service";
import { UserAuthDto } from "dto/user/user.auth.dto";

@Controller('auth')

export class AuthController {
    constructor(private readonly administratorService: AdministratorService,
                private readonly userService: UserService) {}

    @Post('administrator')
    async doLogin (@Body() data: UsernameAdministratorDto, @Req() req: Request): Promise <ApiResponse | LoginInfo> {
        
        const admin = await this.administratorService.getAdminByUsername(data)

        if (!admin) {
            return new ApiResponse('error', -1001, 'Administrator with that username not found')
        }

        const passwordHash = crypto.createHash('sha512')
        passwordHash.update(data.password)
        const passwordHashString = passwordHash.digest('hex').toString().toUpperCase()

        if (passwordHashString !== admin.passwordHash) {
            return new ApiResponse('error', -2002, 'Password is incorect')
        }

        let now = new Date()
        now.setDate(now.getDate() + 14)
        const expiredTimestamp = now.getTime() / 1000;

        const jwtData = new JwtData()
        jwtData.Id = admin.administratorId
        jwtData.identity = admin.username
        jwtData.expire = expiredTimestamp
        jwtData.ipAddress = req.ip
        jwtData.userAgent = req.headers['user-agent']
        jwtData.role = "administrator"
        
        const token = jwt.sign(jwtData.toPlane(), JwtSecret);

        return new LoginInfo(
            jwtData.Id,
            jwtData.identity,
            token
        )
    }

    @Post('user')
    async doLoginUser (@Body() data: UserAuthDto, @Req() req: Request): Promise <ApiResponse | LoginInfo> {
        
        const user = await this.userService.getUserByEmail(data)

        if (!user) {
            return new ApiResponse('error', -1001, 'User with that email not found')
        }

        const passwordHash = crypto.createHash('sha512')
        passwordHash.update(data.password)
        const passwordHashString = passwordHash.digest('hex').toString().toUpperCase()

        if (passwordHashString !== user.passwordHash) {
            return new ApiResponse('error', -2002, 'Password is incorect')
        }

        let now = new Date()
        now.setDate(now.getDate() + 14)
        const expiredTimestamp = now.getTime() / 1000;

        const jwtData = new JwtData()
        jwtData.Id = user.userId
        jwtData.identity = user.email
        jwtData.expire = expiredTimestamp
        jwtData.ipAddress = req.ip
        jwtData.userAgent = req.headers['user-agent']
        jwtData.role = "user"
        
        const token = jwt.sign(jwtData.toPlane(), JwtSecret);

        return new LoginInfo(
            jwtData.Id,
            jwtData.identity,
            token
        )
    }
}