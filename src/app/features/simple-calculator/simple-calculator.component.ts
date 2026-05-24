import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SimpleCalculatorInput } from '../../core/models/mortgage.model';
import { MortgageCalculatorService } from '../../core/services/mortgage-calculator.service';
import { ModularPageComponent } from '../../layout/modular-page/modular-page.component';
import { PaymentBarComponent } from '../../shared/payment-bar/payment-bar.component';
import { PaymentDonutComponent } from '../../shared/payment-donut/payment-donut.component';

@Component({
  selector: 'app-simple-calculator',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
    RouterLink,
    ModularPageComponent,
    PaymentDonutComponent,
    PaymentBarComponent,
  ],
  templateUrl: './simple-calculator.component.html',
  styleUrl: './simple-calculator.component.scss',
})
export class SimpleCalculatorComponent {
  private readonly calc = inject(MortgageCalculatorService);

  readonly input = signal<SimpleCalculatorInput>(this.calc.defaultInput());
  readonly result = computed(() => this.calc.calculateSimple(this.input()));
  readonly downPaymentAmount = computed(
    () => Math.round(this.input().homePrice * (this.input().downPaymentPercent / 100)),
  );

  update<K extends keyof SimpleCalculatorInput>(key: K, value: SimpleCalculatorInput[K]): void {
    this.input.update((prev) => ({ ...prev, [key]: value }));
  }

  onNumberChange(key: keyof SimpleCalculatorInput, raw: string): void {
    const num = Number(raw);
    if (!Number.isFinite(num)) return;
    let v = num;
    if (key === 'homePrice') v = Math.min(50_000_000, Math.max(0, v));
    if (key === 'downPaymentPercent') v = Math.min(100, Math.max(0, v));
    if (key === 'interestRate') v = Math.min(30, Math.max(0, v));
    if (key === 'loanTermYears' && v !== 15 && v !== 20 && v !== 30) return;
    this.update(key, v as SimpleCalculatorInput[typeof key]);
  }

  scrollToResults(): void {
    document.querySelector('.payment-hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setLoanTerm(term: number): void {
    if (term === 15 || term === 20 || term === 30) {
      this.update('loanTermYears', term);
    }
  }
}
