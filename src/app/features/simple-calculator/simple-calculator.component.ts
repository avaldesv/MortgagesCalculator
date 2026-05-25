import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SimpleCalculatorInput } from '../../core/models/mortgage.model';
import { CalculatorStateService } from '../../core/services/calculator-state.service';
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
export class SimpleCalculatorComponent implements OnInit {
  private readonly calc = inject(MortgageCalculatorService);
  private readonly sharedState = inject(CalculatorStateService);

  readonly input = signal<SimpleCalculatorInput>(this.buildInputFromState());
  readonly result = computed(() => this.calc.calculateSimple(this.input()));
  readonly downPaymentPercentLabel = computed(() => {
    const pct = this.calc.downPaymentPercent(
      this.input().homePrice,
      this.input().downPaymentAmount,
    );
    return Math.round(pct * 10) / 10;
  });

  private buildInputFromState(): SimpleCalculatorInput {
    const s = this.sharedState.getSnapshot();
    const base = this.calc.defaultInput();
    return {
      ...base,
      homePrice: s.homePrice,
      downPaymentAmount: s.downPaymentAmount,
      interestRate: s.interestRate,
      loanTermYears: s.loanTermYears,
    };
  }

  private syncToSharedState(): void {
    const i = this.input();
    const r = this.result();
    this.sharedState.patch({
      homePrice: i.homePrice,
      downPaymentAmount: i.downPaymentAmount,
      interestRate: i.interestRate,
      loanTermYears: i.loanTermYears,
      monthlyPayment: r.monthlyPayment,
      loanAmount: r.loanAmount,
    });
  }

  update<K extends keyof SimpleCalculatorInput>(key: K, value: SimpleCalculatorInput[K]): void {
    this.input.update((prev) => ({ ...prev, [key]: value }));
    this.syncToSharedState();
  }

  onNumberChange(key: keyof SimpleCalculatorInput, raw: string): void {
    const num = Number(raw);
    if (!Number.isFinite(num)) return;
    let v = num;
    if (key === 'homePrice') {
      v = Math.min(50_000_000, Math.max(0, v));
      const prev = this.input();
      const down = Math.min(prev.downPaymentAmount, v);
      this.input.update((p) => ({ ...p, homePrice: v, downPaymentAmount: down }));
      this.syncToSharedState();
      return;
    }
    if (key === 'downPaymentAmount') {
      v = Math.min(this.input().homePrice, Math.max(0, v));
    }
    if (key === 'interestRate') v = Math.min(30, Math.max(0, v));
    if (key === 'loanTermYears' && v !== 15 && v !== 20 && v !== 30) return;
    this.update(key, v as SimpleCalculatorInput[typeof key]);
  }

  ngOnInit(): void {
    this.syncToSharedState();
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
