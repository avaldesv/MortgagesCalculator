import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AffordabilityInput, DEFAULT_AFFORDABILITY_INPUT } from '../../core/models/mortgage.model';
import { CalculatorStateService } from '../../core/services/calculator-state.service';
import { MortgageCalculatorService } from '../../core/services/mortgage-calculator.service';
import { ModularPageComponent } from '../../layout/modular-page/modular-page.component';

@Component({
  selector: 'app-affordability-calculator',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DecimalPipe, RouterLink, ModularPageComponent],
  templateUrl: './affordability-calculator.component.html',
  styleUrl: './affordability-calculator.component.scss',
})
export class AffordabilityCalculatorComponent implements OnInit {
  private readonly calc = inject(MortgageCalculatorService);
  private readonly sharedState = inject(CalculatorStateService);

  readonly input = signal<AffordabilityInput>(this.buildInput());
  readonly result = computed(() => this.calc.calculateAffordability(this.input()));

  ngOnInit(): void {
    const payment = this.sharedState.getSnapshot().monthlyPayment;
    if (payment > 0) {
      this.input.update((prev) => ({ ...prev, currentMonthlyHousing: payment }));
    }
  }

  private buildInput(): AffordabilityInput {
    const s = this.sharedState.getSnapshot();
    return {
      ...DEFAULT_AFFORDABILITY_INPUT,
      downPaymentPercent: s.downPaymentPercent,
      interestRate: s.interestRate,
      loanTermYears: s.loanTermYears,
      currentMonthlyHousing: s.monthlyPayment,
    };
  }

  onNumberChange(key: keyof AffordabilityInput, raw: string): void {
    const num = Number(raw);
    if (!Number.isFinite(num)) return;
    let v = num;
    if (key === 'annualGrossIncome') v = Math.min(10_000_000, Math.max(0, v));
    if (key === 'monthlyDebtPayments' || key === 'hoaMonthly' || key === 'currentMonthlyHousing') {
      v = Math.max(0, v);
    }
    if (key === 'downPaymentPercent') v = Math.min(100, Math.max(0, v));
    if (key === 'interestRate') v = Math.min(30, Math.max(0, v));
    if (key === 'propertyTaxRatePercent' || key === 'insuranceRatePercent') {
      v = Math.min(10, Math.max(0, v));
    }
    this.input.update((prev) => ({ ...prev, [key]: v }));
  }

  setLoanTerm(term: number): void {
    if (term === 15 || term === 20 || term === 30) {
      this.input.update((prev) => ({ ...prev, loanTermYears: term }));
    }
  }

  comfortLabel(): string {
    const map = { comfortable: 'Comfortable', stretch: 'Stretch', over: 'Over limit' };
    return map[this.result().comfort];
  }

  meterWidth(percent: number, cap: number): number {
    return Math.min(100, Math.round((percent / cap) * 100));
  }
}
