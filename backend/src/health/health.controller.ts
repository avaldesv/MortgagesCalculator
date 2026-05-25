import { Controller, Get } from '@nestjs/common';
import { DataStoreService } from '../store/data-store.service';

@Controller()
export class HealthController {
  constructor(private readonly store: DataStoreService) {}

  @Get('api/health')
  getHealth(): {
    status: string;
    version: string;
    timestamp: string;
    persistence: string;
  } {
    return {
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      persistence: this.store.persistenceMode,
    };
  }
}
