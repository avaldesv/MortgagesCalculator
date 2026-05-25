import { Module } from '@nestjs/common';
import { AdPlacementsAdminController, AdPlacementsPublicController } from './ad-placements/ad-placements.controller';
import { AdPlacementsService } from './ad-placements/ad-placements.service';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { ListingsAdminController, ListingsPublicController } from './listings/listings.controller';
import { ListingsService } from './listings/listings.service';
import { PartnerLeadsController } from './partner-leads/partner-leads.controller';
import { PartnerLeadsService } from './partner-leads/partner-leads.service';
import { StoreModule } from './store/store.module';

@Module({
  imports: [StoreModule, AuthModule],
  controllers: [
    HealthController,
    AdPlacementsPublicController,
    AdPlacementsAdminController,
    ListingsPublicController,
    ListingsAdminController,
    PartnerLeadsController,
  ],
  providers: [AdPlacementsService, ListingsService, PartnerLeadsService],
})
export class AppModule {}
