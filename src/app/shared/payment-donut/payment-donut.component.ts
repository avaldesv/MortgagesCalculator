import { Component, computed, input } from '@angular/core';
import { PaymentBreakdownItem } from '../../core/models/mortgage.model';

@Component({
  selector: 'app-payment-donut',
  standalone: true,
  templateUrl: './payment-donut.component.html',
  styleUrl: './payment-donut.component.scss',
})
export class PaymentDonutComponent {
  readonly breakdown = input.required<PaymentBreakdownItem[]>();

  readonly gradient = computed(() => {
    let start = 0;
    const stops: string[] = [];
    for (const item of this.breakdown()) {
      const end = start + item.percent;
      stops.push(`${item.color} ${start}% ${end}%`);
      start = end;
    }
    return `conic-gradient(${stops.join(', ')})`;
  });
}
