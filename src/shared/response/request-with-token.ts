import { JwtPayload } from 'src/modules/auth/types/jwt-payload.interface';

declare module 'express' {
  interface Request {
    token: JwtPayload;
  }
}
