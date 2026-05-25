import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdvancedCalculatorInput, DEFAULT_ADVANCED_INPUT } from '../../core/models/mortgage.model';
import { CalculatorStateService } from '../../core/services/calculator-state.service';
import { MortgageCalculatorService } from '../../core/services/mortgage-calculator.service';
import { ModularPageComponent } from '../../layout/modular-page/modular-page.component';
import { PaymentBarComponent } from '../../shared/payment-bar/payment-bar.component';
import { PaymentDonutComponent } from '../../shared/payment-donut/payment-donut.component';

@Component({
  selector: 'app-advanced-calculator',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, ModularPageComponent, PaymentDonutComponent, PaymentBarComponent],
  templateUrl: './advanced-calculator.component.html',
  styleUrl: './advanced-calculator.component.scss',
})
export class AdvancedCalculatorComponent implements OnInit {
  private readonly calc = inject(MortgageCalculatorService);
  private readonly sharedState = inject(CalculatorStateService);

  readonly input = signal<AdvancedCalculatorInput>(this.buildInputFromState());
  readonly result = computed(() => this.calc.calculateAdvanced(this.input()));
  readonly schedulePreview = computed(() => this.result().schedule.slice(0, 12));
  readonly maxYearlyInterest = computed(() =>
    Math.max(1, ...this.result().yearlySummary.map((y) => y.interestPaid)),
  );
  readonly maxYearlyPrincipal = computed(() =>
    Math.max(1, ...this.result().yearlySummary.map((y) => y.principalPaid)),
  );

  ngOnInit(): void {
    this.syncToSharedState();
  }

  private buildInputFromState(): AdvancedCalculatorInput {
    const s = this.sharedState.getSnapshot();
    return {
      ...DEFAULT_ADVANCED_INPUT,
      homePrice: s.homePrice,
      downPaymentPercent: s.downPaymentPercent,
      interestRate: s.interestRate,
      loanTermYears: s.loanTermYears,
    };
  }

  private syncToSharedState(): void {
    const i = this.input();
    const m = this.result().mortgage;
    this.sharedState.patch({
      homePrice: i.homePrice,
      downPaymentPercent: i.downPaymentPercent,
      interestRate: i.interestRate,
      loanTermYears: i.loanTermYears,
      monthlyPayment: m.monthlyPayment,
      loanAmount: m.loanAmount,
    });
  }

  onNumberChange(key: keyof AdvancedCalculatorInput, raw: string): void {
    const num = Number(raw);
    if (!Number.isFinite(num)) return;
    let v = num;
    if (key === 'homePrice') v = Math.min(50_000_000, Math.max(0, v));
    if (key === 'downPaymentPercent') v = Math.min(100, Math.max(0, v));
    if (key === 'interestRate') v = Math.min(30, Math.max(0, v));
    if (key === 'extraMonthlyPayment') v = Math.max(0, v);
    this.input.update((prev) => ({ ...prev, [key]: v }));
    this.syncToSharedState();
  }

  setLoanTerm(term: number): void {
    if (term === 15 || term === 20 || term === 30) {
      this.input.update((prev) => ({ ...prev, loanTermYears: term }));
      this.syncToSharedState();
    }
  }

  yearBarHeight(value: number, max: number): number {
    return Math.round((value / max) * 100);
  }
}
