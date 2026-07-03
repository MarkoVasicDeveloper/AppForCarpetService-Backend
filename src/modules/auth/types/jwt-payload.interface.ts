export interface JwtPayload {
  Id: number;
  identity: string;
  role: 'administrator' | 'user';
  ipAddress: string;
  userAgent: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: number;
  identity: string;
  role: 'administrator' | 'user';
  ipAddress: string;
  userAgent: string;
}
