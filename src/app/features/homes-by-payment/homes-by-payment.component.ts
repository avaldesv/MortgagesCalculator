import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SIMPLE_INPUT } from '../../core/models/mortgage.model';
import { SponsoredListing } from '../../core/models/listings-ad.model';
import { CalculatorStateService } from '../../core/services/calculator-state.service';
import { ListingsAdConfigService } from '../../core/services/listings-ad-config.service';
import { MortgageCalculatorService } from '../../core/services/mortgage-calculator.service';
import { ModularPageComponent } from '../../layout/modular-page/modular-page.component';

@Component({
  selector: 'app-homes-by-payment',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DecimalPipe, ModularPageComponent],
  templateUrl: './homes-by-payment.component.html',
  styleUrl: './homes-by-payment.component.scss',
})
export class HomesByPaymentComponent implements OnInit {
  private readonly adService = inject(ListingsAdConfigService);
  private readonly calc = inject(MortgageCalculatorService);
  private readonly sharedState = inject(CalculatorStateService);

  readonly desiredPayment = signal(2500);
  readonly zipCode = signal('32801');
  readonly minBedrooms = signal(0);
  readonly minBathrooms = signal(0);
  readonly searched = signal(false);

  readonly loanParams = computed(() => {
    const s = this.sharedState.getSnapshot();
    return {
      downPaymentPercent: s.downPaymentPercent,
      interestRate: s.interestRate,
      loanTermYears: s.loanTermYears,
      hoaMonthly: DEFAULT_SIMPLE_INPUT.hoaMonthly,
    };
  });

  readonly estimatedMaxPrice = computed(() =>
    this.calc.estimateHomePriceFromMonthlyPayment(this.desiredPayment(), this.loanParams()),
  );

  readonly allListings = computed(() => {
    this.adService.ensureListingsLoaded();
    return this.adService.listings();
  });

  readonly filteredListings = computed(() => {
    const payment = this.desiredPayment();
    const zip = this.zipCode().trim();
    const beds = this.minBedrooms();
    const baths = this.minBathrooms();
    const slack = 1.08;

    return this.allListings()
      .filter((home) => home.active !== false)
      .filter((home) => home.estimatedMonthlyPayment <= payment * slack)
      .filter((home) => (beds <= 0 ? true : home.bedrooms >= beds))
      .filter((home) => (baths <= 0 ? true : home.bathrooms >= baths))
      .filter((home) => this.matchesZip(home, zip))
      .sort((a, b) => a.estimatedMonthlyPayment - b.estimatedMonthlyPayment);
  });

  ngOnInit(): void {
    const s = this.sharedState.getSnapshot();
    if (s.monthlyPayment > 0) {
      this.desiredPayment.set(Math.round(s.monthlyPayment));
    }
    if (s.zipCode) {
      this.zipCode.set(s.zipCode);
    }
    this.adService.ensureListingsLoaded();
  }

  onSearch(): void {
    this.searched.set(true);
    this.sharedState.patch({ zipCode: this.zipCode().trim() });
    this.adService.refreshListings();
  }

  private matchesZip(home: SponsoredListing, zip: string): boolean {
    if (!zip) return true;
    const q = zip.toLowerCase();
    if (home.zip?.startsWith(zip) || home.zip === zip) return true;
    return `${home.city}, ${home.state}`.toLowerCase().includes(q);
  }
}
