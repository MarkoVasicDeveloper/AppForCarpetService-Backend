import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';

interface AuthenticatedUser {
  id: number;
  identity: string;
  role: 'administrator' | 'user';
  ipAddress: string;
  userAgent: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  override handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser | false,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest<Request>();

    if (err || !user) {
      throw (err as Error) || new UnauthorizedException('Unauthorized (Invalid token)');
    }

    const authUser = user as unknown as AuthenticatedUser;

    if (request.ip !== authUser.ipAddress) {
      throw new UnauthorizedException('Security violation: IP address mismatch');
    }

    if (request.headers['user-agent'] !== authUser.userAgent) {
      throw new UnauthorizedException('Security violation: User-Agent mismatch');
    }

    return user;
  }
}
