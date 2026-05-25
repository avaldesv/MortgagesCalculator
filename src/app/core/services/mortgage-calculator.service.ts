import { Injectable } from '@angular/core';
import {
  AdvancedCalculatorInput,
  AdvancedCalculatorResult,
  AffordabilityComfort,
  AffordabilityInput,
  AffordabilityResult,
  CompareScenarioRow,
  CompareScenariosResult,
  AmortizationRow,
  AmortizationYearSummary,
  DEFAULT_SIMPLE_INPUT,
  MortgageResult,
  PaymentBreakdownItem,
  SimpleCalculatorInput,
} from '../models/mortgage.model';

const FRONT_END_DTI = 0.28;
const BACK_END_DTI = 0.36;
const COMFORT_FRONT_DTI = 0.25;
const COMFORT_BACK_DTI = 0.33;
/** Typical PMI as annual % of loan balance when down payment is under 20%. */
const PMI_ANNUAL_RATE = 0.005;
const PMI_DOWN_THRESHOLD_PERCENT = 20;

@Injectable({ providedIn: 'root' })
export class MortgageCalculatorService {
  /** Monthly PMI from loan size; $0 when down payment is 20% or more. */
  estimatePmiMonthly(loanAmount: number, downPaymentPercent: number): number {
    if (loanAmount <= 0 || downPaymentPercent >= PMI_DOWN_THRESHOLD_PERCENT) {
      return 0;
    }
    return (loanAmount * PMI_ANNUAL_RATE) / 12;
  }

  downPaymentPercent(homePrice: number, downPaymentAmount: number): number {
    if (homePrice <= 0) return 0;
    const down = Math.min(Math.max(0, downPaymentAmount), homePrice);
    return (down / homePrice) * 100;
  }

  calculateSimple(input: SimpleCalculatorInput): MortgageResult {
    const downAmount = Math.min(Math.max(0, input.downPaymentAmount), input.homePrice);
    const loanAmount = Math.max(0, input.homePrice - downAmount);
    const downPaymentPercent = this.downPaymentPercent(input.homePrice, downAmount);
    const principalAndInterest = this.principalAndInterest(
      loanAmount,
      input.interestRate,
      input.loanTermYears,
    );
    const propertyTaxMonthly = input.propertyTaxAnnual / 12;
    const insuranceMonthly = input.insuranceAnnual / 12;
    const pmiMonthly = this.estimatePmiMonthly(loanAmount, downPaymentPercent);
    const hoaMonthly = input.hoaMonthly;

    const parts: Omit<PaymentBreakdownItem, 'percent'>[] = [
      { key: 'pi', label: 'Principal & Interest', monthly: principalAndInterest, color: '#0ea5e9' },
      { key: 'tax', label: 'Property Taxes', monthly: propertyTaxMonthly, color: '#64748b' },
      { key: 'ins', label: 'Home Insurance', monthly: insuranceMonthly, color: '#14b8a6' },
      { key: 'pmi', label: 'PMI', monthly: pmiMonthly, color: '#f59e0b' },
      { key: 'hoa', label: 'HOA', monthly: hoaMonthly, color: '#8b5cf6' },
    ].filter((p) => p.monthly > 0);

    const monthlyPayment = parts.reduce((s, p) => s + p.monthly, 0);
    const breakdown: PaymentBreakdownItem[] = parts.map((p) => ({
      ...p,
      percent: monthlyPayment > 0 ? Math.round((p.monthly / monthlyPayment) * 100) : 0,
    }));

    const months = input.loanTermYears * 12;
    const totalInterest = Math.max(0, principalAndInterest * months - loanAmount);
    const payoffYear = new Date().getFullYear() + input.loanTermYears;

    return {
      loanAmount,
      principalAndInterest,
      propertyTaxMonthly,
      insuranceMonthly,
      pmiMonthly,
      hoaMonthly,
      monthlyPayment,
      totalInterest,
      payoffYear,
      breakdown,
    };
  }

  defaultInput(): SimpleCalculatorInput {
    return { ...DEFAULT_SIMPLE_INPUT };
  }

  estimateHomePriceFromMonthlyPayment(
    targetMonthlyPayment: number,
    params: Pick<
      SimpleCalculatorInput,
      'downPaymentAmount' | 'interestRate' | 'loanTermYears' | 'hoaMonthly'
    >,
    taxRatePercent = 1.27,
    insuranceRatePercent = 0.42,
  ): number {
    return this.estimateMaxHomePriceWithFixedDown(
      {
        annualGrossIncome: 0,
        monthlyDebtPayments: 0,
        downPaymentAmount: params.downPaymentAmount,
        interestRate: params.interestRate,
        loanTermYears: params.loanTermYears,
        propertyTaxRatePercent: taxRatePercent,
        insuranceRatePercent: insuranceRatePercent,
        hoaMonthly: params.hoaMonthly,
        currentMonthlyHousing: 0,
      },
      targetMonthlyPayment,
    );
  }

  private estimateMaxHomePriceWithFixedDown(
    input: Omit<AffordabilityInput, 'downPaymentPercent'> & { downPaymentAmount: number },
    maxMonthlyPayment: number,
  ): number {
    if (maxMonthlyPayment <= 0) return 0;

    let low = 0;
    let high = 5_000_000;
    for (let i = 0; i < 40; i++) {
      const mid = (low + high) / 2;
      const payment = this.monthlyHousingForPriceWithFixedDown(mid, input);
      if (payment <= maxMonthlyPayment) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return Math.round(low);
  }

  private monthlyHousingForPriceWithFixedDown(
    homePrice: number,
    input: Omit<AffordabilityInput, 'downPaymentPercent'> & { downPaymentAmount: number },
  ): number {
    const propertyTaxAnnual = homePrice * (input.propertyTaxRatePercent / 100);
    const insuranceAnnual = homePrice * (input.insuranceRatePercent / 100);
    const downAmount = Math.min(Math.max(0, input.downPaymentAmount), homePrice);
    return this.calculateSimple({
      homePrice,
      downPaymentAmount: downAmount,
      interestRate: input.interestRate,
      loanTermYears: input.loanTermYears,
      propertyTaxAnnual,
      insuranceAnnual,
      pmiMonthly: 0,
      hoaMonthly: input.hoaMonthly,
    }).monthlyPayment;
  }

  compareScenarios(input: SimpleCalculatorInput): CompareScenariosResult {
    const terms: Array<15 | 20 | 30> = [15, 20, 30];
    const baseline = this.calculateSimple({ ...input, loanTermYears: 30 });
    const rows: CompareScenarioRow[] = terms.map((termYears) => {
      const mortgage = this.calculateSimple({ ...input, loanTermYears: termYears });
      return {
        termYears,
        label: `${termYears}-year fixed`,
        mortgage,
        interestSavedVs30: Math.max(0, baseline.totalInterest - mortgage.totalInterest),
      };
    });
    return { input, rows };
  }

  calculateAffordability(input: AffordabilityInput): AffordabilityResult {
    const grossMonthlyIncome = Math.max(0, input.annualGrossIncome) / 12;
    const debts = Math.max(0, input.monthlyDebtPayments);
    const housing = Math.max(0, input.currentMonthlyHousing);

    const maxHousingPaymentFront = grossMonthlyIncome * FRONT_END_DTI;
    const maxHousingPaymentBack = Math.max(0, grossMonthlyIncome * BACK_END_DTI - debts);
    const recommendedMaxPayment = Math.min(maxHousingPaymentFront, maxHousingPaymentBack);

    const frontEndDtiPercent =
      grossMonthlyIncome > 0 ? (housing / grossMonthlyIncome) * 100 : 0;
    const backEndDtiPercent =
      grossMonthlyIncome > 0 ? ((housing + debts) / grossMonthlyIncome) * 100 : 0;

    const affordableHomePrice = this.estimateMaxHomePrice(input, recommendedMaxPayment);
    const comfort = this.affordabilityComfort(
      grossMonthlyIncome,
      housing,
      debts,
    );
    const affordabilityScore = this.affordabilityScore(
      frontEndDtiPercent,
      backEndDtiPercent,
      comfort,
    );

    return {
      grossMonthlyIncome,
      frontEndDtiPercent,
      backEndDtiPercent,
      maxHousingPaymentFront,
      maxHousingPaymentBack,
      recommendedMaxPayment,
      affordableHomePrice,
      comfort,
      affordabilityScore,
    };
  }

  calculateAdvanced(input: AdvancedCalculatorInput): AdvancedCalculatorResult {
    const mortgage = this.calculateSimple(input);
    const schedule = this.buildAmortizationSchedule(
      mortgage.loanAmount,
      input.interestRate,
      input.loanTermYears,
      mortgage.principalAndInterest,
      Math.max(0, input.extraMonthlyPayment),
    );
    const yearlySummary = this.summarizeByYear(schedule);
    return { mortgage, schedule, yearlySummary };
  }

  buildAmortizationSchedule(
    loanAmount: number,
    annualRatePercent: number,
    years: number,
    monthlyPi: number,
    extraMonthly: number,
  ): AmortizationRow[] {
    if (loanAmount <= 0) return [];

    const r = annualRatePercent / 100 / 12;
    const maxMonths = years * 12;
    const rows: AmortizationRow[] = [];
    let balance = loanAmount;

    for (let month = 1; month <= maxMonths && balance > 0.01; month++) {
      const interest = balance * r;
      let principal = monthlyPi - interest;
      if (principal < 0) principal = 0;
      const extra = Math.min(extraMonthly, Math.max(0, balance - principal));
      const totalPrincipal = Math.min(balance, principal + extra);
      const payment = interest + totalPrincipal;
      balance = Math.max(0, balance - totalPrincipal);

      rows.push({
        month,
        payment,
        principal: totalPrincipal - extra,
        interest,
        extraPrincipal: extra,
        balance,
      });
    }

    return rows;
  }

  private summarizeByYear(schedule: AmortizationRow[]): AmortizationYearSummary[] {
    const byYear = new Map<number, AmortizationYearSummary>();
    for (const row of schedule) {
      const year = Math.ceil(row.month / 12);
      const existing = byYear.get(year) ?? {
        year,
        principalPaid: 0,
        interestPaid: 0,
        endBalance: row.balance,
      };
      existing.principalPaid += row.principal + row.extraPrincipal;
      existing.interestPaid += row.interest;
      existing.endBalance = row.balance;
      byYear.set(year, existing);
    }
    return [...byYear.values()];
  }

  private estimateMaxHomePrice(input: AffordabilityInput, maxMonthlyPayment: number): number {
    if (maxMonthlyPayment <= 0) return 0;

    let low = 0;
    let high = 5_000_000;
    for (let i = 0; i < 40; i++) {
      const mid = (low + high) / 2;
      const payment = this.monthlyHousingForPrice(mid, input);
      if (payment <= maxMonthlyPayment) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return Math.round(low);
  }

  private monthlyHousingForPrice(homePrice: number, input: AffordabilityInput): number {
    const propertyTaxAnnual = homePrice * (input.propertyTaxRatePercent / 100);
    const insuranceAnnual = homePrice * (input.insuranceRatePercent / 100);
    const downAmount = homePrice * (input.downPaymentPercent / 100);
    return this.calculateSimple({
      homePrice,
      downPaymentAmount: downAmount,
      interestRate: input.interestRate,
      loanTermYears: input.loanTermYears,
      propertyTaxAnnual,
      insuranceAnnual,
      pmiMonthly: 0,
      hoaMonthly: input.hoaMonthly,
    }).monthlyPayment;
  }

  private affordabilityComfort(
    grossMonthly: number,
    housing: number,
    debts: number,
  ): AffordabilityComfort {
    if (grossMonthly <= 0) return 'stretch';
    const front = housing / grossMonthly;
    const back = (housing + debts) / grossMonthly;
    if (front > FRONT_END_DTI || back > BACK_END_DTI) return 'over';
    if (front <= COMFORT_FRONT_DTI && back <= COMFORT_BACK_DTI) return 'comfortable';
    return 'stretch';
  }

  private affordabilityScore(
    frontPct: number,
    backPct: number,
    comfort: AffordabilityComfort,
  ): number {
    if (comfort === 'comfortable') {
      return Math.round(Math.min(100, 85 + (COMFORT_FRONT_DTI * 100 - frontPct)));
    }
    if (comfort === 'over') {
      const overFront = Math.max(0, frontPct - FRONT_END_DTI * 100);
      const overBack = Math.max(0, backPct - BACK_END_DTI * 100);
      return Math.max(0, Math.round(45 - overFront - overBack * 0.5));
    }
    return Math.round(
      Math.min(84, 70 + (FRONT_END_DTI * 100 - frontPct) * 0.5 + (BACK_END_DTI * 100 - backPct) * 0.3),
    );
  }

  private principalAndInterest(
    principal: number,
    annualRatePercent: number,
    years: number,
  ): number {
    if (principal <= 0) return 0;
    const r = annualRatePercent / 100 / 12;
    const n = years * 12;
    if (r === 0) return principal / n;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
}
