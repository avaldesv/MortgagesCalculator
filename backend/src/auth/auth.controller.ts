import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

class LoginDto {
  email!: string;
  password!: string;
}

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    if (!body?.email || !body?.password) {
      throw new UnauthorizedException({
        code: 'VALIDATION_ERROR',
        message: 'Email and password are required.',
      });
    }
    return this.auth.login(body.email, body.password);
  }
}
