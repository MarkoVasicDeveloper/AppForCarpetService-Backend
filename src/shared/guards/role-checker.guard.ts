import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthenticatedUser } from 'src/modules/auth/types/jwt-payload.interface';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RoleCheckerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();

    const user = req.user as AuthenticatedUser | undefined;

    if (!user || !user.role) {
      return false;
    }

    const allow_to_roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());

    if (!allow_to_roles) {
      return true;
    }

    if (!allow_to_roles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
