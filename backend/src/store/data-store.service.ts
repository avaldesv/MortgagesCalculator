import { Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JsonFileStorage } from './json-file.storage';
import { PrismaStorage } from './prisma.storage';

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

export interface MarketListingsSettings {
  enabled: boolean;
  maxCount: number;
  tabs: TabsTarget;
  city: string;
  state: string;
  zipCode: string;
  label: string;
  updatedAt: string;
}

export interface PartnerLead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  serviceType: string;
  targetRegion: string;
  monthlyBudget?: number;
  message?: string;
  consentContact: boolean;
  createdAt: string;
}

@Injectable()
export class DataStoreService implements OnModuleInit {
  readonly persistenceMode: 'json' | 'prisma';

  private json?: JsonFileStorage;
  private prismaStore?: PrismaStorage;

  constructor(@Optional() private readonly prisma?: PrismaService) {
    this.persistenceMode = process.env.DATABASE_URL ? 'prisma' : 'json';
  }

  async onModuleInit(): Promise<void> {
    if (this.persistenceMode === 'prisma' && this.prisma) {
      this.prismaStore = new PrismaStorage(this.prisma);
      await this.prismaStore.init();
    } else {
      this.json = new JsonFileStorage();
      this.json.init();
    }
  }

  async getPlacements(): Promise<AdPlacement[]> {
    if (this.prismaStore) return this.prismaStore.getPlacementsAsync();
    return this.json!.getPlacements();
  }

  async getPlacement(id: string): Promise<AdPlacement | undefined> {
    if (this.prismaStore) return this.prismaStore.getPlacementAsync(id);
    return this.json!.getPlacement(id);
  }

  async upsertPlacement(placement: AdPlacement): Promise<void> {
    if (this.prismaStore) return this.prismaStore.upsertPlacementAsync(placement);
    this.json!.upsertPlacement(placement);
  }

  async deletePlacement(id: string): Promise<boolean> {
    if (this.prismaStore) return this.prismaStore.deletePlacementAsync(id);
    return this.json!.deletePlacement(id);
  }

  async getListings(): Promise<SponsoredListing[]> {
    if (this.prismaStore) return this.prismaStore.getListingsAsync();
    return this.json!.getListings();
  }

  async getListing(id: string): Promise<SponsoredListing | undefined> {
    if (this.prismaStore) return this.prismaStore.getListingAsync(id);
    return this.json!.getListing(id);
  }

  async upsertListing(listing: SponsoredListing): Promise<void> {
    if (this.prismaStore) return this.prismaStore.upsertListingAsync(listing);
    this.json!.upsertListing(listing);
  }

  async deleteListing(id: string): Promise<boolean> {
    if (this.prismaStore) return this.prismaStore.deleteListingAsync(id);
    return this.json!.deleteListing(id);
  }

  async addPartnerLead(lead: PartnerLead): Promise<void> {
    if (this.prismaStore) return this.prismaStore.addPartnerLeadAsync(lead);
    this.json!.addPartnerLead(lead);
  }

  async getPartnerLeads(): Promise<PartnerLead[]> {
    if (this.prismaStore) return this.prismaStore.getPartnerLeadsAsync();
    return this.json!.getPartnerLeads();
  }

  async getMarketListingsSettings(): Promise<MarketListingsSettings | undefined> {
    if (this.prismaStore) return this.prismaStore.getMarketListingsSettingsAsync();
    return this.json!.getMarketListingsSettings();
  }

  async setMarketListingsSettings(settings: MarketListingsSettings): Promise<void> {
    if (this.prismaStore) return this.prismaStore.setMarketListingsSettingsAsync(settings);
    this.json!.setMarketListingsSettings(settings);
  }
}
