import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('api/health')
  getHealth(): { status: string; version: string; timestamp: string } {
    return {
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  }
}
