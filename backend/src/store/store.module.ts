import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataStoreService } from './data-store.service';

const usePrisma = Boolean(process.env.DATABASE_URL);

@Global()
@Module({
  providers: [...(usePrisma ? [PrismaService] : []), DataStoreService],
  exports: [DataStoreService],
})
export class StoreModule {}
