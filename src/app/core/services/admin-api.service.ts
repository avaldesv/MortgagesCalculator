import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ListingsAdPlacement, SponsoredListing } from '../models/listings-ad.model';
import { AdminAuthService } from './admin-auth.service';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);

  listPlacements() {
    return this.http.get<{ data: ListingsAdPlacement[] }>(
      `${environment.apiBaseUrl}/api/v1/admin/ad-placements`,
      { headers: this.auth.getAuthHeaders() },
    );
  }

  patchPlacement(id: string, body: Partial<ListingsAdPlacement>) {
    return this.http.patch<ListingsAdPlacement>(
      `${environment.apiBaseUrl}/api/v1/admin/ad-placements/${id}`,
      body,
      { headers: this.auth.getAuthHeaders() },
    );
  }

  listListings() {
    return this.http.get<{ data: SponsoredListing[]; meta: unknown }>(
      `${environment.apiBaseUrl}/api/v1/admin/listings`,
      { headers: this.auth.getAuthHeaders() },
    );
  }

  patchListing(id: string, body: Partial<SponsoredListing>) {
    return this.http.patch<SponsoredListing>(
      `${environment.apiBaseUrl}/api/v1/admin/listings/${id}`,
      body,
      { headers: this.auth.getAuthHeaders() },
    );
  }
}
