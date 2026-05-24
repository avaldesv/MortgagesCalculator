import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  AdPagePosition,
  ListingsAdPlacement,
  SponsoredListing,
} from '../models/listings-ad.model';
import type { TabId } from '../models/tab.model';

interface ActiveAdPlacementsResponse {
  tabId: TabId;
  placements: ListingsAdPlacement[];
}

interface PaginatedListingsResponse {
  data: SponsoredListing[];
  meta: { page: number; pageSize: number; total: number };
}

@Injectable({ providedIn: 'root' })
export class ListingsAdConfigService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiBaseUrl;

  private readonly placementMaps = signal<Partial<Record<TabId, Map<AdPagePosition, ListingsAdPlacement>>>>(
    {},
  );
  private readonly listingsCache = signal<SponsoredListing[]>([]);
  private listingsLoaded = false;

  loadPlacementsForTab(tabId: TabId): void {
    this.http
      .get<ActiveAdPlacementsResponse>(`${this.apiBase}/api/v1/ad-placements/active`, {
        params: { tab: tabId },
      })
      .subscribe({
        next: (res) => {
          const map = new Map<AdPagePosition, ListingsAdPlacement>();
          for (const p of res.placements ?? []) {
            map.set(p.position, p);
          }
          this.placementMaps.update((prev) => ({ ...prev, [tabId]: map }));
        },
        error: () => {
          this.placementMaps.update((prev) => ({ ...prev, [tabId]: new Map() }));
        },
      });
  }

  getActivePlacementsForTab(tabId: TabId): Map<AdPagePosition, ListingsAdPlacement> {
    return this.placementMaps()[tabId] ?? new Map();
  }

  ensureListingsLoaded(): void {
    if (this.listingsLoaded) return;
    this.listingsLoaded = true;
    this.http
      .get<PaginatedListingsResponse>(`${this.apiBase}/api/v1/listings`, {
        params: { sponsored: 'true', pageSize: '50' },
      })
      .subscribe({
        next: (res) => this.listingsCache.set(res.data ?? []),
        error: () => this.listingsCache.set([]),
      });
  }

  getListings(): SponsoredListing[] {
    this.ensureListingsLoaded();
    return this.listingsCache();
  }

  refreshListings(): void {
    this.listingsLoaded = false;
    this.ensureListingsLoaded();
  }
}
