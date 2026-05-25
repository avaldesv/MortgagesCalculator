import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ListingsAdPlacement, SponsoredListing } from '../../core/models/listings-ad.model';
import { AdminApiService } from '../../core/services/admin-api.service';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { ListingsAdConfigService } from '../../core/services/listings-ad-config.service';

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
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly publicAds = inject(ListingsAdConfigService);

  readonly placements = signal<ListingsAdPlacement[]>([]);
  readonly listings = signal<SponsoredListing[]>([]);
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
    const done = () => {
      if (placementsDone && listingsDone) this.loading.set(false);
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
