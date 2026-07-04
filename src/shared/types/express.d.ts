import { AuthenticatedUser } from 'src/modules/auth/types/jwt-payload.interface';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
