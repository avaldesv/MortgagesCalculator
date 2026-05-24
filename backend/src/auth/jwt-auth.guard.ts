import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header.',
      });
    }
    const token = header.slice(7);
    try {
      (req as Request & { user: unknown }).user = this.jwt.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token.',
      });
    }
  }
}
