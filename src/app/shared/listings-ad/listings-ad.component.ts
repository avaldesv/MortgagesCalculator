import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { ListingsAdPlacement } from '../../core/models/listings-ad.model';
import { ListingsAdConfigService } from '../../core/services/listings-ad-config.service';

@Component({
  selector: 'app-listings-ad',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './listings-ad.component.html',
  styleUrl: './listings-ad.component.scss',
})
export class ListingsAdComponent {
  readonly placement = input.required<ListingsAdPlacement>();
  readonly monthlyPayment = input(0);

  private readonly adService = inject(ListingsAdConfigService);

  readonly listings = computed(() => {
    const max = this.placement().maxListings ?? 3;
    return this.adService.getListings().slice(0, max);
  });

  readonly label = computed(() => this.placement().sponsoredLabel ?? 'Sponsored');
}
