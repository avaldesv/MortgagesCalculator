import { Component, effect, inject, input } from '@angular/core';
import { AD_PAGE_POSITIONS } from '../../core/models/listings-ad.model';
import type { TabId } from '../../core/models/tab.model';
import { ListingsAdConfigService } from '../../core/services/listings-ad-config.service';
import { ListingsAdComponent } from '../../shared/listings-ad/listings-ad.component';
import { UsMarketListingsComponent } from '../../shared/us-market-listings/us-market-listings.component';

@Component({
  selector: 'app-modular-page',
  standalone: true,
  imports: [ListingsAdComponent, UsMarketListingsComponent],
  templateUrl: './modular-page.component.html',
  styleUrl: './modular-page.component.scss',
})
export class ModularPageComponent {
  readonly tabId = input.required<TabId>();
  readonly monthlyPayment = input(0);

  private readonly adConfig = inject(ListingsAdConfigService);
  readonly positions = AD_PAGE_POSITIONS;

  constructor() {
    effect(() => {
      this.adConfig.loadPlacementsForTab(this.tabId());
      this.adConfig.ensureListingsLoaded();
    });
  }

  slotsFor(position: (typeof AD_PAGE_POSITIONS)[number]) {
    const map = this.adConfig.getActivePlacementsForTab(this.tabId());
    return map.get(position) ?? null;
  }
}
