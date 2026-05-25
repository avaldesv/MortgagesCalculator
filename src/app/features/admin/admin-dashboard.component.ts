import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ListingsAdPlacement, SponsoredListing } from '../../core/models/listings-ad.model';
import { MarketListingsSettings } from '../../core/models/market-listings.model';
import { AdminApiService } from '../../core/services/admin-api.service';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { ListingsAdConfigService } from '../../core/services/listings-ad-config.service';
import { MarketListingsService } from '../../core/services/market-listings.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <section class="admin-dash">
      <header class="admin-dash__head">
        <h1>Admin dashboard</h1>
        <button type="button" class="btn btn--secondary" (click)="logout()">Log out</button>
      </header>

      @if (loadError()) {
        <p class="admin-error card" role="alert">{{ loadError() }}</p>
      }

      <div class="card">
        <h2>Ad placements</h2>
        @if (placements().length === 0 && !loading()) {
          <p class="admin-empty">No placements loaded. Check API connection or log in again.</p>
        }
        @for (p of placements(); track p.id) {
          <div class="admin-row">
            <div>
              <strong>{{ p.id }}</strong> — {{ p.position }}
              <span class="admin-row__meta">priority {{ p.priority ?? 0 }}</span>
            </div>
            <label class="admin-toggle">
              <input type="checkbox" [checked]="p.enabled" (change)="togglePlacement(p, $event)" />
              Enabled
            </label>
          </div>
        }
      </div>

      <div class="card">
        <h2>Sponsored listings</h2>
        @if (listings().length === 0 && !loading()) {
          <p class="admin-empty">No listings loaded.</p>
        }
        @for (l of listings(); track l.id) {
          <div class="admin-row">
            <div>
              <strong>{{ l.city }}, {{ l.state }}</strong> — {{ l.estimatedMonthlyPayment | number: '1.0-0' }}/mo
            </div>
            <label class="admin-toggle">
              <input type="checkbox" [checked]="l.active" (change)="toggleListing(l, $event)" />
              Active
            </label>
          </div>
        }
      </div>

      <div class="card">
        <h2>US market listings (Straply)</h2>
        <p class="admin-hint">
          Real for-sale homes shown below sponsored ads. Requires <code>STRAPLY_API_KEY</code> on the API
          (<a href="https://straply.com/dashboard" target="_blank" rel="noopener">straply.com/dashboard</a>).
        </p>
        @if (marketSettings(); as m) {
          <label class="admin-toggle admin-toggle--block">
            <input type="checkbox" [checked]="m.enabled" (change)="toggleMarketEnabled($event)" />
            Show module on site
          </label>
          <div class="admin-field">
            <label for="market-max">Homes to show (1–12)</label>
            <input
              id="market-max"
              type="number"
              min="1"
              max="12"
              [value]="m.maxCount"
              (change)="saveMarketMax($event)"
            />
          </div>
          <div class="admin-field">
            <label for="market-city">Search city</label>
            <input id="market-city" type="text" [value]="m.city" (change)="saveMarketCity($event)" />
          </div>
          <div class="admin-field">
            <label for="market-state">State (2 letters)</label>
            <input
              id="market-state"
              type="text"
              maxlength="2"
              [value]="m.state"
              (change)="saveMarketState($event)"
            />
          </div>
          <div class="admin-field">
            <label for="market-zip">ZIP code (required for Straply)</label>
            <input
              id="market-zip"
              type="text"
              maxlength="5"
              [value]="m.zipCode"
              (change)="saveMarketZip($event)"
            />
          </div>
          <div class="admin-field">
            <label for="market-label">Section title</label>
            <input id="market-label" type="text" [value]="m.label" (change)="saveMarketLabel($event)" />
          </div>
        } @else if (!loading()) {
          <p class="admin-empty">Market settings not loaded.</p>
        }
      </div>

      <a routerLink="/simple-calculator">View public site</a>
    </section>
  `,
  styles: `
    .admin-dash {
      max-width: 720px;
      margin: 0 auto 2rem;
      padding: 0 1rem;
    }
    .admin-dash__head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1.5rem 0 1rem;
    }
    .admin-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--color-border);
    }
    .admin-row__meta {
      display: block;
      font-size: 0.8rem;
      color: var(--color-muted);
    }
    .admin-toggle {
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .admin-empty {
      margin: 0;
      color: var(--color-muted);
      font-size: 0.9rem;
    }
    .admin-error {
      color: #b91c1c;
      border-color: #fecaca;
      background: #fef2f2;
    }
    .admin-hint {
      margin: 0 0 0.75rem;
      font-size: 0.85rem;
      color: var(--color-muted);
    }
    .admin-toggle--block {
      margin-bottom: 0.75rem;
    }
    .admin-field {
      margin-bottom: 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.9rem;
    }
    .admin-field input {
      padding: 0.4rem 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
    }
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly publicAds = inject(ListingsAdConfigService);
  private readonly publicMarket = inject(MarketListingsService);

  readonly placements = signal<ListingsAdPlacement[]>([]);
  readonly listings = signal<SponsoredListing[]>([]);
  readonly marketSettings = signal<MarketListingsSettings | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/admin/login']);
      return;
    }
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.loadError.set(null);
    let placementsDone = false;
    let listingsDone = false;
    let marketDone = false;
    const done = () => {
      if (placementsDone && listingsDone && marketDone) this.loading.set(false);
    };

    this.api.listPlacements().subscribe({
      next: (r) => {
        this.placements.set(Array.isArray(r.data) ? r.data : []);
        placementsDone = true;
        done();
      },
      error: () => {
        this.loadError.set('Could not load ad placements. Try logging out and in again.');
        placementsDone = true;
        done();
      },
    });

    this.api.listListings().subscribe({
      next: (r) => {
        this.listings.set(Array.isArray(r.data) ? r.data : []);
        listingsDone = true;
        done();
      },
      error: () => {
        this.loadError.set('Could not load listings. Try logging out and in again.');
        listingsDone = true;
        done();
      },
    });

    this.api.getMarketListingsSettings().subscribe({
      next: (s) => {
        this.marketSettings.set(s);
        marketDone = true;
        done();
      },
      error: () => {
        marketDone = true;
        done();
      },
    });
  }

  private patchMarket(body: Partial<MarketListingsSettings>): void {
    this.api.patchMarketListingsSettings(body).subscribe({
      next: (s) => {
        this.marketSettings.set(s);
        this.publicMarket.clearCache();
      },
    });
  }

  toggleMarketEnabled(e: Event): void {
    this.patchMarket({ enabled: (e.target as HTMLInputElement).checked });
  }

  saveMarketMax(e: Event): void {
    const n = Number((e.target as HTMLInputElement).value);
    if (!Number.isNaN(n)) this.patchMarket({ maxCount: n });
  }

  saveMarketCity(e: Event): void {
    const city = (e.target as HTMLInputElement).value.trim();
    if (city) this.patchMarket({ city });
  }

  saveMarketState(e: Event): void {
    const state = (e.target as HTMLInputElement).value.trim().toUpperCase().slice(0, 2);
    if (state.length === 2) this.patchMarket({ state });
  }

  saveMarketLabel(e: Event): void {
    const label = (e.target as HTMLInputElement).value.trim();
    if (label) this.patchMarket({ label });
  }

  saveMarketZip(e: Event): void {
    const zipCode = (e.target as HTMLInputElement).value.trim().slice(0, 5);
    if (/^\d{5}$/.test(zipCode)) this.patchMarket({ zipCode });
  }

  togglePlacement(p: ListingsAdPlacement, e: Event): void {
    const enabled = (e.target as HTMLInputElement).checked;
    this.api.patchPlacement(p.id, { enabled }).subscribe({
      next: () => {
        this.reload();
        this.publicAds.refreshListings();
      },
    });
  }

  toggleListing(l: SponsoredListing, e: Event): void {
    const active = (e.target as HTMLInputElement).checked;
    this.api.patchListing(l.id, { active }).subscribe({
      next: () => {
        this.reload();
        this.publicAds.refreshListings();
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
