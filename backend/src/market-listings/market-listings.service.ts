import { Injectable } from '@nestjs/common';
import type { TabId } from '../store/data-store.service';
import { DataStoreService } from '../store/data-store.service';
import { GeoIpService } from './geo-ip.service';
import { fetchStraplyProperties } from './straply.client';
import {
  DEFAULT_MARKET_LISTINGS_SETTINGS,
  MarketListingsSettings,
  tabAllowed,
  UsMarketListing,
} from './market-listings.types';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

@Injectable()
export class MarketListingsService {
  private cache: {
    key: string;
    listings: UsMarketListing[];
    fetchedAt: number;
  } | null = null;

  constructor(
    private readonly store: DataStoreService,
    private readonly geoIp: GeoIpService,
  ) {}

  async getSettings(): Promise<MarketListingsSettings> {
    const stored = await this.store.getMarketListingsSettings();
    return { ...DEFAULT_MARKET_LISTINGS_SETTINGS, ...stored, zipCode: stored?.zipCode ?? DEFAULT_MARKET_LISTINGS_SETTINGS.zipCode };
  }

  getAdminStatus(): { straplyConfigured: boolean } {
    return { straplyConfigured: Boolean(process.env.STRAPLY_API_KEY?.trim()) };
  }

  async getSettingsForAdmin(): Promise<MarketListingsSettings & { straplyConfigured: boolean }> {
    const settings = await this.getSettings();
    return { ...settings, ...this.getAdminStatus() };
  }

  async updateSettings(patch: Partial<MarketListingsSettings>): Promise<MarketListingsSettings> {
    const current = await this.getSettings();
    const next: MarketListingsSettings = {
      ...current,
      ...patch,
      maxCount: clampMaxCount(patch.maxCount ?? current.maxCount),
      updatedAt: new Date().toISOString(),
    };
    await this.store.setMarketListingsSettings(next);
    this.cache = null;
    return next;
  }

  async listForTab(
    tabId: TabId,
    clientIp?: string,
  ): Promise<{
    data: UsMarketListing[];
    meta: {
      enabled: boolean;
      source: string;
      label?: string;
      cachedAt?: string;
      message?: string;
      zipCode?: string;
      locationSource?: 'visitor-geo' | 'admin-fallback';
      city?: string;
      state?: string;
    };
  }> {
    const settings = await this.getSettings();
    if (!settings.enabled || !tabAllowed(settings.tabs, tabId)) {
      return { data: [], meta: { enabled: false, source: 'disabled', label: settings.label } };
    }

    const apiKey = process.env.STRAPLY_API_KEY?.trim();
    if (!apiKey) {
      return {
        data: [],
        meta: {
          enabled: true,
          source: 'unconfigured',
          label: settings.label,
          message: 'Set STRAPLY_API_KEY on the API service (free tier at straply.com/dashboard).',
        },
      };
    }

    const geo = await this.geoIp.resolveUsLocation(clientIp);
    const fallbackZip = settings.zipCode?.trim();
    const zip = geo?.zipCode ?? fallbackZip;
    const city = geo?.city ?? settings.city;
    const state = geo?.state ?? settings.state;
    const locationSource = geo ? ('visitor-geo' as const) : ('admin-fallback' as const);

    if (!zip) {
      return {
        data: [],
        meta: {
          enabled: true,
          source: 'unconfigured',
          label: settings.label,
          message: 'Set ZIP code in admin (Straply search requires zipCode).',
          locationSource,
        },
      };
    }

    const limit = clampMaxCount(settings.maxCount);
    const cacheKey = `${zip}|${limit}`;
    const now = Date.now();
    if (this.cache?.key === cacheKey && now - this.cache.fetchedAt < CACHE_TTL_MS) {
      return {
        data: this.cache.listings,
        meta: {
          enabled: true,
          source: 'straply',
          label: settings.label,
          zipCode: zip,
          locationSource,
          city,
          state,
          cachedAt: new Date(this.cache.fetchedAt).toISOString(),
        },
      };
    }

    const locationMeta = { zipCode: zip, locationSource, city, state };

    try {
      const listings = await fetchStraplyProperties(apiKey, {
        city,
        state,
        zipCode: zip,
        limit,
      });
      this.cache = { key: cacheKey, listings, fetchedAt: now };
      return {
        data: listings,
        meta: {
          enabled: true,
          source: 'straply',
          label: settings.label,
          cachedAt: new Date(now).toISOString(),
          ...locationMeta,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Straply request failed';
      if (this.cache?.key === cacheKey) {
        return {
          data: this.cache.listings,
          meta: {
            enabled: true,
            source: 'straply-stale',
            label: settings.label,
            cachedAt: new Date(this.cache.fetchedAt).toISOString(),
            message,
            ...locationMeta,
          },
        };
      }
      return {
        data: [],
        meta: { enabled: true, source: 'error', label: settings.label, message, ...locationMeta },
      };
    }
  }
}

function clampMaxCount(n: number): number {
  return Math.min(12, Math.max(1, Math.round(n) || 4));
}
