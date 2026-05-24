import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListingsAdConfigService } from '../../core/services/listings-ad-config.service';
import { ModularPageComponent } from '../../layout/modular-page/modular-page.component';

@Component({
  selector: 'app-homes-by-payment',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DecimalPipe, ModularPageComponent],
  templateUrl: './homes-by-payment.component.html',
  styleUrl: './homes-by-payment.component.scss',
})
export class HomesByPaymentComponent {
  private readonly adService = inject(ListingsAdConfigService);

  desiredPayment = 2500;
  zipCode = '32801';
  readonly listings = this.adService.getListings();
}
