import { Injectable } from '@angular/core';
import {
  AdPagePosition,
  ListingsAdAdminConfig,
  ListingsAdPlacement,
  SponsoredListing,
} from '../models/listings-ad.model';
import type { TabId } from '../models/tab.model';

@Injectable({ providedIn: 'root' })
export class ListingsAdConfigService {
  private readonly config: ListingsAdAdminConfig = {
    updatedAt: '2026-05-24T00:00:00Z',
    placements: [
      {
        id: 'slot-simple-right',
        enabled: true,
        position: 'middle-right',
        tabs: ['simple-calculator', 'advanced-calculator', 'affordability'],
        maxListings: 2,
        sponsoredLabel: 'Sponsored',
        priority: 10,
      },
      {
        id: 'slot-homes-footer',
        enabled: true,
        position: 'footer',
        tabs: ['homes-by-payment'],
        maxListings: 3,
        sponsoredLabel: 'Sponsored Home',
        priority: 5,
      },
    ],
  };

  private readonly listings: SponsoredListing[] = [
    {
      id: 'lst-1',
      price: 425000,
      city: 'Orlando',
      state: 'FL',
      estimatedMonthlyPayment: 2780,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1850,
      agentOrCompany: 'Sunshine Realty Group',
      listingUrl: 'https://example.com/listing/1',
    },
    {
      id: 'lst-2',
      price: 389000,
      city: 'Tampa',
      state: 'FL',
      estimatedMonthlyPayment: 2540,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1620,
      agentOrCompany: 'Gulf Coast Homes',
      listingUrl: 'https://example.com/listing/2',
    },
    {
      id: 'lst-3',
      price: 515000,
      city: 'Austin',
      state: 'TX',
      estimatedMonthlyPayment: 3120,
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 2100,
      agentOrCompany: 'Lone Star Listings',
      listingUrl: 'https://example.com/listing/3',
    },
  ];

  getConfig(): ListingsAdAdminConfig {
    return this.config;
  }

  getListings(): SponsoredListing[] {
    return this.listings;
  }

  getActivePlacementsForTab(tabId: TabId): Map<AdPagePosition, ListingsAdPlacement> {
    const active = this.config.placements
      .filter((p) => p.enabled && this.appliesToTab(p, tabId))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    const map = new Map<AdPagePosition, ListingsAdPlacement>();
    for (const p of active) {
      if (!map.has(p.position)) {
        map.set(p.position, p);
      }
    }
    return map;
  }

  private appliesToTab(placement: ListingsAdPlacement, tabId: TabId): boolean {
    return placement.tabs === 'all' || placement.tabs.includes(tabId);
  }
}
