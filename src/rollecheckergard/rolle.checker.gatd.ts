/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from 'express';
import { Reflector } from "@nestjs/core";

@Injectable()

export class RolleCheckerGard implements CanActivate {
    constructor(private reflector: Reflector) { }
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req: Request = context.switchToHttp().getRequest();
        const role = req.token.role;

        const allow_to_roles = this.reflector.get<('administrator' | 'user')[]>('allow_to_roles', context.getHandler());

        if (!allow_to_roles.includes(role)) {
            return false;
        }

        return true;
    }
}