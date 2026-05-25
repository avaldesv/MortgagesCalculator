import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MarketListingsResponse, MarketListingsSettings } from '../models/market-listings.model';
import type { TabId } from '../models/tab.model';

@Injectable({ providedIn: 'root' })
export class MarketListingsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiBaseUrl;

  private readonly byTab = signal<Partial<Record<TabId, MarketListingsResponse>>>({});

  loadForTab(tabId: TabId): void {
    if (this.byTab()[tabId]) return;
    this.http
      .get<MarketListingsResponse>(`${this.apiBase}/api/v1/market-listings`, {
        params: { tab: tabId },
      })
      .subscribe({
        next: (res) => this.byTab.update((prev) => ({ ...prev, [tabId]: res })),
        error: () =>
          this.byTab.update((prev) => ({
            ...prev,
            [tabId]: { data: [], meta: { enabled: false, source: 'error' } },
          })),
      });
  }

  snapshotForTab(tabId: TabId): MarketListingsResponse | undefined {
    return this.byTab()[tabId];
  }

  clearCache(): void {
    this.byTab.set({});
  }
}

@Injectable({ providedIn: 'root' })
export class MarketListingsAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiBaseUrl;

  getSettings(headers: Record<string, string>) {
    return this.http.get<MarketListingsSettings>(
      `${this.apiBase}/api/v1/admin/market-listings/settings`,
      { headers },
    );
  }

  patchSettings(body: Partial<MarketListingsSettings>, headers: Record<string, string>) {
    return this.http.patch<MarketListingsSettings>(
      `${this.apiBase}/api/v1/admin/market-listings/settings`,
      body,
      { headers },
    );
  }
}
