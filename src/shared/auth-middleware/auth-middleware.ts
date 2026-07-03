import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { AdministratorService } from 'src/modules/administrator/administrator.service';
import { JwtPayload } from 'src/modules/auth/types/jwt-payload.interface';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly administratorService: AdministratorService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers['authorization']) {
      throw new HttpException('Header not exist', HttpStatus.UNAUTHORIZED);
    }

    const token = req.headers['authorization'].split(' ')[1];
    let jwtDataObject: JwtPayload;
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      const decoded = jwt.verify(token, jwtSecret);
      jwtDataObject = decoded as unknown as JwtPayload;
    } catch (e) {
      throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
    }

    if (!jwtDataObject) {
      throw new HttpException('Token is incorect', HttpStatus.UNAUTHORIZED);
    }

    if (req.ip !== jwtDataObject.ipAddress) {
      throw new HttpException('Bad token found and ip', HttpStatus.UNAUTHORIZED);
    }

    if (req.headers['user-agent'] !== jwtDataObject.userAgent) {
      throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
    }

    if (jwtDataObject.role === 'administrator') {
      const admin = await this.administratorService.getAdminById(jwtDataObject.Id);

      if (!admin) {
        throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
      }

      if (admin.username !== jwtDataObject.identity) {
        throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
      }
    } else {
      const user = await this.userService.getUserById(jwtDataObject.Id);

      if (!user) {
        throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
      }

      if (user.email !== jwtDataObject.identity) {
        throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
      }
    }

    const trenutniTimestamp = new Date().getTime() / 1000;
    if (trenutniTimestamp >= jwtDataObject.exp!) {
      throw new HttpException('The token has expired', HttpStatus.UNAUTHORIZED);
    }

    req.token = jwtDataObject;

    next();
  }
}
