import { Injectable, NotFoundException } from '@nestjs/common';
import { DataStoreService, SponsoredListing } from '../store/data-store.service';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

@Injectable()
export class ListingsService {
  constructor(private readonly store: DataStoreService) {}

  listAdmin(page = 1, pageSize = 20, active?: boolean) {
    let items = this.store.getListings();
    if (active !== undefined) items = items.filter((l) => l.active === active);
    return this.paginate(items, page, pageSize);
  }

  listPublic(params: {
    sponsored?: string;
    zip?: string;
    maxPayment?: number;
    page?: number;
    pageSize?: number;
  }) {
    if (params.sponsored !== 'true') {
      return { data: [] as SponsoredListing[], meta: { page: 1, pageSize: 20, total: 0 } };
    }
    let items = this.store.getListings().filter((l) => l.active);
    if (params.zip) items = items.filter((l) => l.zip === params.zip);
    if (params.maxPayment != null && !Number.isNaN(params.maxPayment)) {
      const cap = params.maxPayment * 1.1;
      items = items.filter((l) => l.estimatedMonthlyPayment <= cap);
    }
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));
    return this.paginate(items, page, pageSize);
  }

  getOne(id: string): SponsoredListing {
    const l = this.store.getListing(id);
    if (!l) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Listing not found.' });
    return l;
  }

  create(input: SponsoredListing): SponsoredListing {
    const listing: SponsoredListing = {
      ...input,
      id: input.id || `lst-${Date.now()}`,
      active: input.active ?? true,
    };
    this.store.upsertListing(listing);
    return listing;
  }

  update(id: string, patch: Partial<SponsoredListing>): SponsoredListing {
    const existing = this.getOne(id);
    const listing = { ...existing, ...patch, id };
    this.store.upsertListing(listing);
    return listing;
  }

  remove(id: string): void {
    if (!this.store.deleteListing(id)) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Listing not found.' });
    }
  }

  private paginate(items: SponsoredListing[], page: number, pageSize: number) {
    const total = items.length;
    const start = (page - 1) * pageSize;
    const data = items.slice(start, start + pageSize);
    return { data, meta: { page, pageSize, total } satisfies PaginationMeta };
  }
}
