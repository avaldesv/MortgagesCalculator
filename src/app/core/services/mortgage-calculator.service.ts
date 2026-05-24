import { Injectable } from '@angular/core';
import {
  DEFAULT_SIMPLE_INPUT,
  MortgageResult,
  PaymentBreakdownItem,
  SimpleCalculatorInput,
} from '../models/mortgage.model';

@Injectable({ providedIn: 'root' })
export class MortgageCalculatorService {
  calculateSimple(input: SimpleCalculatorInput): MortgageResult {
    const downAmount = input.homePrice * (input.downPaymentPercent / 100);
    const loanAmount = Math.max(0, input.homePrice - downAmount);
    const principalAndInterest = this.principalAndInterest(
      loanAmount,
      input.interestRate,
      input.loanTermYears,
    );
    const propertyTaxMonthly = input.propertyTaxAnnual / 12;
    const insuranceMonthly = input.insuranceAnnual / 12;
    const pmiMonthly =
      input.downPaymentPercent < 20
        ? input.pmiMonthly || loanAmount * 0.005 / 12
        : input.pmiMonthly;
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
