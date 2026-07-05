import * as crypto from 'crypto';

export class CryptoUtil {
  static hashPassword(password: string): string {
    return crypto.createHash('sha512').update(password).digest('hex').toUpperCase();
  }
}
