import { Injectable, OnModuleInit } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export type TabId =
  | 'simple-calculator'
  | 'advanced-calculator'
  | 'affordability'
  | 'compare-scenarios'
  | 'homes-by-payment'
  | 'learning-center'
  | 'partners';

export type AdPagePosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'footer';

export type TabsTarget = TabId[] | 'all';

export interface AdPlacement {
  id: string;
  enabled: boolean;
  position: AdPagePosition;
  tabs: TabsTarget;
  maxListings?: number;
  sponsoredLabel?: string;
  priority?: number;
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
  zip?: string;
  active: boolean;
}

interface StoreData {
  placements: AdPlacement[];
  listings: SponsoredListing[];
}

@Injectable()
export class DataStoreService implements OnModuleInit {
  private data!: StoreData;
  private readonly storePath = join(process.cwd(), 'data', 'store.json');
  private readonly seedPath = join(process.cwd(), 'data', 'seed.json');

  onModuleInit(): void {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (existsSync(this.storePath)) {
      this.data = JSON.parse(readFileSync(this.storePath, 'utf8')) as StoreData;
    } else {
      this.data = JSON.parse(readFileSync(this.seedPath, 'utf8')) as StoreData;
      this.persist();
    }
  }

  private persist(): void {
    writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  getPlacements(): AdPlacement[] {
    return [...this.data.placements];
  }

  getPlacement(id: string): AdPlacement | undefined {
    return this.data.placements.find((p) => p.id === id);
  }

  upsertPlacement(placement: AdPlacement): void {
    const idx = this.data.placements.findIndex((p) => p.id === placement.id);
    if (idx >= 0) this.data.placements[idx] = placement;
    else this.data.placements.push(placement);
    this.persist();
  }

  deletePlacement(id: string): boolean {
    const before = this.data.placements.length;
    this.data.placements = this.data.placements.filter((p) => p.id !== id);
    if (this.data.placements.length === before) return false;
    this.persist();
    return true;
  }

  getListings(): SponsoredListing[] {
    return [...this.data.listings];
  }

  getListing(id: string): SponsoredListing | undefined {
    return this.data.listings.find((l) => l.id === id);
  }

  upsertListing(listing: SponsoredListing): void {
    const idx = this.data.listings.findIndex((l) => l.id === listing.id);
    if (idx >= 0) this.data.listings[idx] = listing;
    else this.data.listings.push(listing);
    this.persist();
  }

  deleteListing(id: string): boolean {
    const before = this.data.listings.length;
    this.data.listings = this.data.listings.filter((l) => l.id !== id);
    if (this.data.listings.length === before) return false;
    this.persist();
    return true;
  }
}
