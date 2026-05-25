import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MarketListingsService } from '../../core/services/market-listings.service';
import type { TabId } from '../../core/models/tab.model';

@Component({
  selector: 'app-us-market-listings',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './us-market-listings.component.html',
  styleUrl: './us-market-listings.component.scss',
})
export class UsMarketListingsComponent {
  readonly tabId = input.required<TabId>();

  private readonly market = inject(MarketListingsService);

  constructor() {
    effect(() => this.market.loadForTab(this.tabId()));
  }

  readonly response = computed(() => this.market.snapshotForTab(this.tabId()));
  readonly enabled = computed(() => this.response()?.meta.enabled === true);
  readonly visible = computed(() => {
    const res = this.response();
    return this.enabled() && (res?.data?.length ?? 0) > 0;
  });
  readonly showUnavailable = computed(() => {
    const res = this.response();
    return this.enabled() && (res?.data?.length ?? 0) === 0 && !!res;
  });
  readonly label = computed(() => this.response()?.meta.label ?? 'Homes for sale in the U.S.');
  readonly listings = computed(() => this.response()?.data ?? []);
  readonly attribution = computed(() => {
    const src = this.response()?.meta.source;
    if (src === 'straply' || src === 'straply-stale') return 'Listing data via Straply';
    return null;
  });
}
