/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { JwtData } from "dto/jwt/jwt.dto";
import { NextFunction, Request } from "express";
import * as jwt from 'jsonwebtoken';
import { JwtSecret } from "src/misc/jwt.secret";
import { AdministratorService } from "src/services/administrator/administrator.service";
import { UserService } from "src/services/user/user.service";

@Injectable()

export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService,
                private readonly administratorService: AdministratorService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        
        if(!req.headers['authorization']) {
            throw new HttpException('Header not exist', HttpStatus.UNAUTHORIZED)
        }

        const token = req.headers['authorization'].split(' ')[1]

        const jwtDataObject: JwtData = jwt.verify(token, JwtSecret) as any;

        if (!jwtDataObject) {
            throw new HttpException('Token is incorect', HttpStatus.UNAUTHORIZED)
        }

        if (req.ip !== jwtDataObject.ipAddress) {
            throw new HttpException('Bad token found and ip', HttpStatus.UNAUTHORIZED)
        }

        if (req.headers['user-agent'] !== jwtDataObject.userAgent) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED)
        }

        if (jwtDataObject.role === 'administrator') {
            const admin = await this.administratorService.getAdminById(jwtDataObject.Id)

            if (!admin) {
                throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED)
            }

            if (admin.username !== jwtDataObject.identity) {
                throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED)
            }
        }else {
            const user = await this.userService.getUserById(jwtDataObject.Id);

            if (!user) {
                throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED)
            }

            if (user.email !== jwtDataObject.identity) {
                throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED)
            }
        }

        // Proveriti da li je token istekao

        const trenutniTimestamp = new Date().getTime() / 1000;
        if (trenutniTimestamp >= jwtDataObject.expire) {
            throw new HttpException('The token has expired', HttpStatus.UNAUTHORIZED);
        }

        req.token = jwtDataObject;

        next();
    }
}