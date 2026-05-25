import { Injectable, computed, inject, signal } from '@angular/core';
import {
  CalculatorStateSnapshot,
  DEFAULT_CALCULATOR_STATE,
} from '../models/calculator-state.model';
import { MortgageCalculatorService } from './mortgage-calculator.service';

const STORAGE_KEY = 'mortgagecalc_calculator_state_v2';
const LEGACY_STORAGE_KEY = 'mortgagecalc_calculator_state_v1';

@Injectable({ providedIn: 'root' })
export class CalculatorStateService {
  private readonly mortgage = inject(MortgageCalculatorService);

  private readonly state = signal<CalculatorStateSnapshot>(this.loadFromSession());

  readonly snapshot = computed(() => this.state());

  readonly homePrice = computed(() => this.state().homePrice);
  readonly downPaymentAmount = computed(() => this.state().downPaymentAmount);
  readonly interestRate = computed(() => this.state().interestRate);
  readonly loanTermYears = computed(() => this.state().loanTermYears);
  readonly zipCode = computed(() => this.state().zipCode);
  readonly monthlyPayment = computed(() => this.state().monthlyPayment);
  readonly loanAmount = computed(() => this.state().loanAmount);

  patch(partial: Partial<CalculatorStateSnapshot>): void {
    this.state.update((prev) => {
      const next = { ...prev, ...partial };
      return this.withDerived(next);
    });
    this.persist();
  }

  reset(): void {
    this.state.set(this.withDerived({ ...DEFAULT_CALCULATOR_STATE }));
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  getSnapshot(): CalculatorStateSnapshot {
    return { ...this.state() };
  }

  /** Sync monthly payment / loan amount from mortgage inputs. */
  recalculateFromMortgageInputs(): void {
    const s = this.state();
    const result = this.mortgage.calculateSimple({
      homePrice: s.homePrice,
      downPaymentAmount: s.downPaymentAmount,
      interestRate: s.interestRate,
      loanTermYears: s.loanTermYears,
      propertyTaxAnnual: 5400,
      insuranceAnnual: 1800,
      pmiMonthly: 0,
      hoaMonthly: 0,
    });
    this.patch({
      monthlyPayment: result.monthlyPayment,
      loanAmount: result.loanAmount,
    });
  }

  private withDerived(s: CalculatorStateSnapshot): CalculatorStateSnapshot {
    const down = Math.min(Math.max(0, s.downPaymentAmount), s.homePrice);
    const loanAmount = Math.max(0, s.homePrice - down);
    return { ...s, downPaymentAmount: down, loanAmount };
  }

  private loadFromSession(): CalculatorStateSnapshot {
    try {
      const raw =
        sessionStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return this.withDerived({ ...DEFAULT_CALCULATOR_STATE });
      const parsed = JSON.parse(raw) as CalculatorStateSnapshot & {
        downPaymentPercent?: number;
      };
      const migrated = this.migrateSnapshot(parsed);
      return this.withDerived({ ...DEFAULT_CALCULATOR_STATE, ...migrated });
    } catch {
      return this.withDerived({ ...DEFAULT_CALCULATOR_STATE });
    }
  }

  private migrateSnapshot(
    parsed: CalculatorStateSnapshot & { downPaymentPercent?: number },
  ): CalculatorStateSnapshot {
    if (
      typeof parsed.downPaymentAmount === 'number' &&
      Number.isFinite(parsed.downPaymentAmount)
    ) {
      return parsed;
    }
    const homePrice = parsed.homePrice ?? DEFAULT_CALCULATOR_STATE.homePrice;
    const pct = parsed.downPaymentPercent ?? 20;
    return {
      ...parsed,
      downPaymentAmount: Math.round(homePrice * (pct / 100)),
    };
  }

  private persist(): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
    } catch {
      /* private mode / quota */
    }
  }
}
