import type { MarketListingsSettings, TabId, TabsTarget } from '../store/data-store.service';

export type { MarketListingsSettings };

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

export const DEFAULT_MARKET_LISTINGS_SETTINGS: MarketListingsSettings = {
  enabled: true,
  maxCount: 4,
  tabs: ['simple-calculator', 'advanced-calculator', 'affordability', 'homes-by-payment'],
  city: 'Orlando',
  state: 'FL',
  zipCode: '32801',
  label: 'Homes for sale in the U.S.',
  updatedAt: new Date().toISOString(),
};

export function tabAllowed(tabs: TabsTarget, tabId: TabId): boolean {
  if (tabs === 'all') return true;
  return Array.isArray(tabs) && tabs.includes(tabId);
}
