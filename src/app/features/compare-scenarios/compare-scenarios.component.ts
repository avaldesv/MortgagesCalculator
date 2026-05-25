import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SIMPLE_INPUT, SimpleCalculatorInput } from '../../core/models/mortgage.model';
import { CalculatorStateService } from '../../core/services/calculator-state.service';
import { MortgageCalculatorService } from '../../core/services/mortgage-calculator.service';
import { ModularPageComponent } from '../../layout/modular-page/modular-page.component';

@Component({
  selector: 'app-compare-scenarios',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, ModularPageComponent],
  templateUrl: './compare-scenarios.component.html',
  styleUrl: './compare-scenarios.component.scss',
})
export class CompareScenariosComponent {
  private readonly calc = inject(MortgageCalculatorService);
  private readonly sharedState = inject(CalculatorStateService);

  readonly input = signal<SimpleCalculatorInput>(this.buildInput());
  readonly comparison = computed(() => this.calc.compareScenarios(this.input()));
  readonly maxInterestSaved = computed(() =>
    Math.max(1, ...this.comparison().rows.map((r) => r.interestSavedVs30)),
  );
  readonly thirtyYearPayment = computed(
    () => this.comparison().rows.find((r) => r.termYears === 30)?.mortgage.monthlyPayment ?? 0,
  );

  private buildInput(): SimpleCalculatorInput {
    const s = this.sharedState.getSnapshot();
    return {
      ...DEFAULT_SIMPLE_INPUT,
      homePrice: s.homePrice,
      downPaymentAmount: s.downPaymentAmount,
      interestRate: s.interestRate,
    };
  }

  onNumberChange(key: keyof SimpleCalculatorInput, raw: string): void {
    const num = Number(raw);
    if (!Number.isFinite(num)) return;
    let v = num;
    if (key === 'homePrice') v = Math.min(50_000_000, Math.max(0, v));
    if (key === 'downPaymentAmount') {
      v = Math.min(this.input().homePrice, Math.max(0, v));
    }
    if (key === 'interestRate') v = Math.min(30, Math.max(0, v));
    if (key === 'homePrice') {
      const down = Math.min(this.input().downPaymentAmount, v);
      this.input.update((prev) => ({ ...prev, homePrice: v, downPaymentAmount: down }));
      return;
    }
    this.input.update((prev) => ({ ...prev, [key]: v }));
  }

  savingsBarHeight(saved: number): number {
    return Math.round((saved / this.maxInterestSaved()) * 100);
  }
}
