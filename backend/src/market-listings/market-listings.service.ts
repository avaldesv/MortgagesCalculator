import { Injectable } from '@nestjs/common';
import type { TabId } from '../store/data-store.service';
import { DataStoreService } from '../store/data-store.service';
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

  constructor(private readonly store: DataStoreService) {}

  async getSettings(): Promise<MarketListingsSettings> {
    const stored = await this.store.getMarketListingsSettings();
    return { ...DEFAULT_MARKET_LISTINGS_SETTINGS, ...stored, zipCode: stored?.zipCode ?? DEFAULT_MARKET_LISTINGS_SETTINGS.zipCode };
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

  async listForTab(tabId: TabId): Promise<{
    data: UsMarketListing[];
    meta: {
      enabled: boolean;
      source: string;
      label?: string;
      cachedAt?: string;
      message?: string;
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

    const zip = settings.zipCode?.trim();
    if (!zip) {
      return {
        data: [],
        meta: {
          enabled: true,
          source: 'unconfigured',
          label: settings.label,
          message: 'Set ZIP code in admin (Straply search requires zipCode).',
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
          cachedAt: new Date(this.cache.fetchedAt).toISOString(),
        },
      };
    }

    try {
      const listings = await fetchStraplyProperties(apiKey, {
        city: settings.city,
        state: settings.state,
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
          },
        };
      }
      return { data: [], meta: { enabled: true, source: 'error', label: settings.label, message } };
    }
  }
}

function clampMaxCount(n: number): number {
  return Math.min(12, Math.max(1, Math.round(n) || 4));
}
