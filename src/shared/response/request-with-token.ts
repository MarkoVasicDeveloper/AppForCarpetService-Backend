import { JwtData } from 'src/modules/auth/dto/jwt.dto';

declare module 'express' {
  interface Request {
    token: JwtData;
  }
}
