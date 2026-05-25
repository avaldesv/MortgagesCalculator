import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
    if (process.env.PRISMA_MIGRATE_ON_START === 'true') {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
