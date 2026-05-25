import type { TabId } from './tab.model';

export type TabsTarget = TabId[] | 'all';

export interface MarketListingsSettings {
  enabled: boolean;
  maxCount: number;
  tabs: TabsTarget;
  city: string;
  state: string;
  zipCode: string;
  label: string;
  updatedAt: string;
  /** Present on admin GET only — server has STRAPLY_API_KEY env */
  straplyConfigured?: boolean;
}

export interface UsMarketListing {
  id: string;
  price: number;
  city: string;
  state: string;
  zipCode: string;
  addressLine: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  estimatedMonthlyPayment: number;
  listingUrl: string;
  imageUrl?: string;
  daysOnMarket?: number;
  propertyType?: string;
}

export interface MarketListingsResponse {
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
}
