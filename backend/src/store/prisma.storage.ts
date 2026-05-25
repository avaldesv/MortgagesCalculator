import { readFileSync } from 'fs';
import { join } from 'path';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdPlacement,
  MarketListingsSettings,
  PartnerLead,
  SponsoredListing,
  TabsTarget,
} from './data-store.service';
interface SeedFile {
  placements: AdPlacement[];
  listings: SponsoredListing[];
  partnerLeads?: PartnerLead[];
  marketListingsSettings?: MarketListingsSettings;
}

export class PrismaStorage {
  constructor(private readonly prisma: PrismaService) {}

  async init(): Promise<void> {
    const marketCount = await this.prisma.marketListingsConfig.count();
    if (marketCount === 0) {
      const seedPath = join(process.cwd(), 'data', 'seed.json');
      const seed = JSON.parse(readFileSync(seedPath, 'utf8')) as SeedFile;
      if (seed.marketListingsSettings) {
        await this.setMarketListingsSettingsAsync(seed.marketListingsSettings);
      }
    }

    const count = await this.prisma.adPlacement.count();
    if (count > 0) return;

    const seedPath = join(process.cwd(), 'data', 'seed.json');
    const seed = JSON.parse(readFileSync(seedPath, 'utf8')) as SeedFile;

    for (const p of seed.placements) {
      await this.prisma.adPlacement.create({
        data: {
          id: p.id,
          enabled: p.enabled,
          position: p.position,
          tabs: p.tabs as Prisma.InputJsonValue,
          maxListings: p.maxListings ?? null,
          sponsoredLabel: p.sponsoredLabel ?? null,
          priority: p.priority ?? null,
          updatedAt: new Date(p.updatedAt),
        },
      });
    }

    for (const l of seed.listings) {
      await this.prisma.sponsoredListing.create({
        data: {
          id: l.id,
          price: l.price,
          city: l.city,
          state: l.state,
          estimatedMonthlyPayment: l.estimatedMonthlyPayment,
          bedrooms: l.bedrooms,
          bathrooms: l.bathrooms,
          squareFeet: l.squareFeet,
          agentOrCompany: l.agentOrCompany,
          listingUrl: l.listingUrl,
          zip: l.zip ?? null,
          active: l.active,
        },
      });
    }
  }

  private mapPlacement(row: {
    id: string;
    enabled: boolean;
    position: string;
    tabs: unknown;
    maxListings: number | null;
    sponsoredLabel: string | null;
    priority: number | null;
    updatedAt: Date;
  }): AdPlacement {
    return {
      id: row.id,
      enabled: row.enabled,
      position: row.position as AdPlacement['position'],
      tabs: row.tabs as TabsTarget,
      maxListings: row.maxListings ?? undefined,
      sponsoredLabel: row.sponsoredLabel ?? undefined,
      priority: row.priority ?? undefined,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async getPlacementsAsync(): Promise<AdPlacement[]> {
    const rows = await this.prisma.adPlacement.findMany();
    return rows.map((r) => this.mapPlacement(r));
  }

  async getPlacementAsync(id: string): Promise<AdPlacement | undefined> {
    const row = await this.prisma.adPlacement.findUnique({ where: { id } });
    return row ? this.mapPlacement(row) : undefined;
  }

  async upsertPlacementAsync(placement: AdPlacement): Promise<void> {
    await this.prisma.adPlacement.upsert({
      where: { id: placement.id },
      create: {
        id: placement.id,
        enabled: placement.enabled,
        position: placement.position,
        tabs: placement.tabs as Prisma.InputJsonValue,
        maxListings: placement.maxListings ?? null,
        sponsoredLabel: placement.sponsoredLabel ?? null,
        priority: placement.priority ?? null,
        updatedAt: new Date(placement.updatedAt),
      },
      update: {
        enabled: placement.enabled,
        position: placement.position,
        tabs: placement.tabs as Prisma.InputJsonValue,
        maxListings: placement.maxListings ?? null,
        sponsoredLabel: placement.sponsoredLabel ?? null,
        priority: placement.priority ?? null,
        updatedAt: new Date(placement.updatedAt),
      },
    });
  }

  async deletePlacementAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.adPlacement.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getListingsAsync(): Promise<SponsoredListing[]> {
    const rows = await this.prisma.sponsoredListing.findMany();
    return rows.map((r) => ({
      id: r.id,
      price: r.price,
      city: r.city,
      state: r.state,
      estimatedMonthlyPayment: r.estimatedMonthlyPayment,
      bedrooms: r.bedrooms,
      bathrooms: r.bathrooms,
      squareFeet: r.squareFeet,
      agentOrCompany: r.agentOrCompany,
      listingUrl: r.listingUrl,
      zip: r.zip ?? undefined,
      active: r.active,
    }));
  }

  async getListingAsync(id: string): Promise<SponsoredListing | undefined> {
    const r = await this.prisma.sponsoredListing.findUnique({ where: { id } });
    if (!r) return undefined;
    return {
      id: r.id,
      price: r.price,
      city: r.city,
      state: r.state,
      estimatedMonthlyPayment: r.estimatedMonthlyPayment,
      bedrooms: r.bedrooms,
      bathrooms: r.bathrooms,
      squareFeet: r.squareFeet,
      agentOrCompany: r.agentOrCompany,
      listingUrl: r.listingUrl,
      zip: r.zip ?? undefined,
      active: r.active,
    };
  }

  async upsertListingAsync(listing: SponsoredListing): Promise<void> {
    await this.prisma.sponsoredListing.upsert({
      where: { id: listing.id },
      create: {
        id: listing.id,
        price: listing.price,
        city: listing.city,
        state: listing.state,
        estimatedMonthlyPayment: listing.estimatedMonthlyPayment,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        squareFeet: listing.squareFeet,
        agentOrCompany: listing.agentOrCompany,
        listingUrl: listing.listingUrl,
        zip: listing.zip ?? null,
        active: listing.active,
      },
      update: {
        price: listing.price,
        city: listing.city,
        state: listing.state,
        estimatedMonthlyPayment: listing.estimatedMonthlyPayment,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        squareFeet: listing.squareFeet,
        agentOrCompany: listing.agentOrCompany,
        listingUrl: listing.listingUrl,
        zip: listing.zip ?? null,
        active: listing.active,
      },
    });
  }

  async deleteListingAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.sponsoredListing.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async addPartnerLeadAsync(lead: PartnerLead): Promise<void> {
    await this.prisma.partnerLead.create({
      data: {
        id: lead.id,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        serviceType: lead.serviceType,
        targetRegion: lead.targetRegion,
        monthlyBudget: lead.monthlyBudget ?? null,
        message: lead.message ?? null,
        consentContact: lead.consentContact,
        createdAt: new Date(lead.createdAt),
      },
    });
  }

  async getMarketListingsSettingsAsync(): Promise<MarketListingsSettings | undefined> {
    const row = await this.prisma.marketListingsConfig.findUnique({ where: { id: 'default' } });
    if (!row) return undefined;
    return {
      enabled: row.enabled,
      maxCount: row.maxCount,
      tabs: row.tabs as TabsTarget,
      city: row.city,
      state: row.state,
      zipCode: row.zipCode,
      label: row.label,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async setMarketListingsSettingsAsync(settings: MarketListingsSettings): Promise<void> {
    await this.prisma.marketListingsConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        enabled: settings.enabled,
        maxCount: settings.maxCount,
        tabs: settings.tabs as Prisma.InputJsonValue,
        city: settings.city,
        state: settings.state,
        zipCode: settings.zipCode,
        label: settings.label,
        updatedAt: new Date(settings.updatedAt),
      },
      update: {
        enabled: settings.enabled,
        maxCount: settings.maxCount,
        tabs: settings.tabs as Prisma.InputJsonValue,
        city: settings.city,
        state: settings.state,
        zipCode: settings.zipCode,
        label: settings.label,
        updatedAt: new Date(settings.updatedAt),
      },
    });
  }

  async getPartnerLeadsAsync(): Promise<PartnerLead[]> {
    const rows = await this.prisma.partnerLead.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      company: r.company,
      email: r.email,
      phone: r.phone,
      serviceType: r.serviceType,
      targetRegion: r.targetRegion,
      monthlyBudget: r.monthlyBudget ?? undefined,
      message: r.message ?? undefined,
      consentContact: r.consentContact,
      createdAt: r.createdAt.toISOString(),
    }));
  }

}
