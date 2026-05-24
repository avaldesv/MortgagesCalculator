import type { TabId } from './tab.model';

export const AD_PAGE_POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'footer',
] as const;

export type AdPagePosition = (typeof AD_PAGE_POSITIONS)[number];

export interface ListingsAdPlacement {
  id: string;
  enabled: boolean;
  position: AdPagePosition;
  tabs: TabId[] | 'all';
  maxListings?: number;
  sponsoredLabel?: string;
  priority?: number;
}

export interface ListingsAdAdminConfig {
  placements: ListingsAdPlacement[];
  updatedAt: string;
}

export interface SponsoredListing {
  id: string;
  price: number;
  city: string;
  state: string;
  estimatedMonthlyPayment: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  agentOrCompany: string;
  listingUrl: string;
}
