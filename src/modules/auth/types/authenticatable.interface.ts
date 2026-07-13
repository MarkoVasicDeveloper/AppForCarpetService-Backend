import { Role } from 'src/shared/enums/role.enum';

export const AUTH_PROVIDER_TOKEN = Symbol('AUTH_PROVIDER_TOKEN');

export interface IAuthProfile {
  id: number;
  identity: string;
  passwordHash: string;
  role: Role;
  userId?: number;
  isVerified?: boolean;
}

export interface IAuthenticatableService {
  authenticateIdentity(identity: string): Promise<IAuthProfile | null>;
}
