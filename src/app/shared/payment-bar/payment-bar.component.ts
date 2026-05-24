import { Component, input } from '@angular/core';
import { PaymentBreakdownItem } from '../../core/models/mortgage.model';

@Component({
  selector: 'app-payment-bar',
  standalone: true,
  templateUrl: './payment-bar.component.html',
  styleUrl: './payment-bar.component.scss',
})
export class PaymentBarComponent {
  readonly breakdown = input.required<PaymentBreakdownItem[]>();
}
