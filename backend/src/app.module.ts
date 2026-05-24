import { Module } from '@nestjs/common';
import { AdPlacementsAdminController, AdPlacementsPublicController } from './ad-placements/ad-placements.controller';
import { AdPlacementsService } from './ad-placements/ad-placements.service';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { ListingsAdminController, ListingsPublicController } from './listings/listings.controller';
import { ListingsService } from './listings/listings.service';
import { StoreModule } from './store/store.module';

@Module({
  imports: [StoreModule, AuthModule],
  controllers: [
    HealthController,
    AdPlacementsPublicController,
    AdPlacementsAdminController,
    ListingsPublicController,
    ListingsAdminController,
  ],
  providers: [AdPlacementsService, ListingsService],
})
export class AppModule {}
