import { Role } from 'src/shared/enums/role.enum';

export interface JwtPayload {
  Id: number;
  identity: string;
  role: Role;
  ipAddress: string;
  userAgent: string;
  userId?: number;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: number;
  identity: string;
  role: Role;
  ipAddress: string;
  userAgent: string;
  userId?: number;
}
