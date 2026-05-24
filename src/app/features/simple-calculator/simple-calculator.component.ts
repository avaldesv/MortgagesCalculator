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

  update<K extends keyof SimpleCalculatorInput>(key: K, value: SimpleCalculatorInput[K]): void {
    this.input.update((prev) => ({ ...prev, [key]: value }));
  }

  onNumberChange(key: keyof SimpleCalculatorInput, raw: string): void {
    const num = Number(raw);
    if (!Number.isFinite(num)) return;
    this.update(key, num as SimpleCalculatorInput[typeof key]);
  }

  setLoanTerm(term: number): void {
    if (term === 15 || term === 20 || term === 30) {
      this.update('loanTermYears', term);
    }
  }
}
