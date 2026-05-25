import { Module } from '@nestjs/common';
import { AdPlacementsAdminController, AdPlacementsPublicController } from './ad-placements/ad-placements.controller';
import { AdPlacementsService } from './ad-placements/ad-placements.service';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { ListingsAdminController, ListingsPublicController } from './listings/listings.controller';
import { ListingsService } from './listings/listings.service';
import {
  MarketListingsAdminController,
  MarketListingsPublicController,
} from './market-listings/market-listings.controller';
import { GeoIpService } from './market-listings/geo-ip.service';
import { MarketListingsService } from './market-listings/market-listings.service';
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
    MarketListingsPublicController,
    MarketListingsAdminController,
  ],
  providers: [
    AdPlacementsService,
    ListingsService,
    PartnerLeadsService,
    GeoIpService,
    MarketListingsService,
  ],
})
export class AppModule {}
