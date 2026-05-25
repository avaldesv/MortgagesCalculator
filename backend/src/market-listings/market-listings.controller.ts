import { Body, Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { TabId } from '../store/data-store.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { extractClientIp } from './client-ip.util';
import { MarketListingsService } from './market-listings.service';
import type { MarketListingsSettings } from './market-listings.types';

@Controller('api/v1/market-listings')
export class MarketListingsPublicController {
  constructor(private readonly market: MarketListingsService) {}

  @Get()
  list(@Query('tab') tab?: string, @Req() req?: Request) {
    const tabId = (tab ?? 'simple-calculator') as TabId;
    return this.market.listForTab(tabId, req ? extractClientIp(req) : undefined);
  }
}

@Controller('api/v1/admin/market-listings')
@UseGuards(JwtAuthGuard)
export class MarketListingsAdminController {
  constructor(private readonly market: MarketListingsService) {}

  @Get('settings')
  getSettings() {
    return this.market.getSettingsForAdmin();
  }

  @Patch('settings')
  patchSettings(@Body() body: Partial<MarketListingsSettings>) {
    return this.market.updateSettings(body);
  }
}
