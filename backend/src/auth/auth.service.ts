import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync, hashSync } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  login(email: string, password: string): { accessToken: string; expiresIn: number; tokenType: 'Bearer' } {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@mortgagecalc.app';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'changeme123';
    const adminHash = process.env.ADMIN_PASSWORD_HASH;

    if (email !== adminEmail) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect.',
      });
    }

    const valid = adminHash
      ? compareSync(password, adminHash)
      : password === adminPassword;

    if (!valid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect.',
      });
    }

    const expiresIn = 3600;
    const accessToken = this.jwt.sign({ sub: 'admin', email: adminEmail }, { expiresIn });
    return { accessToken, expiresIn, tokenType: 'Bearer' };
  }

  /** Generate hash for ADMIN_PASSWORD_HASH env (dev helper). */
  static hashPassword(plain: string): string {
    return hashSync(plain, 10);
  }
}
