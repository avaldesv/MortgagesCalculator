import { TestBed } from '@angular/core/testing';
import { DEFAULT_SIMPLE_INPUT } from '../models/mortgage.model';
import { MortgageCalculatorService } from './mortgage-calculator.service';

describe('MortgageCalculatorService', () => {
  let service: MortgageCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MortgageCalculatorService);
  });

  it('calculates loan amount from home price and down percent', () => {
    const result = service.calculateSimple({
      ...DEFAULT_SIMPLE_INPUT,
      homePrice: 400_000,
      downPaymentPercent: 20,
    });
    expect(result.loanAmount).toBe(320_000);
  });

  it('computes principal and interest for a standard 30-year loan', () => {
    const result = service.calculateSimple({
      ...DEFAULT_SIMPLE_INPUT,
      homePrice: 300_000,
      downPaymentPercent: 20,
      interestRate: 6,
      loanTermYears: 30,
      propertyTaxAnnual: 0,
      insuranceAnnual: 0,
      pmiMonthly: 0,
      hoaMonthly: 0,
    });
    expect(result.principalAndInterest).toBeCloseTo(1438.92, 1);
    expect(result.monthlyPayment).toBeCloseTo(result.principalAndInterest, 2);
  });

  it('sums breakdown percents when taxes and insurance are included', () => {
    const result = service.calculateSimple(DEFAULT_SIMPLE_INPUT);
    const percentSum = result.breakdown.reduce((s, item) => s + item.percent, 0);
    expect(percentSum).toBeGreaterThan(0);
    expect(result.monthlyPayment).toBeGreaterThan(result.principalAndInterest);
  });

  it('returns zero P&I when loan amount is zero', () => {
    const result = service.calculateSimple({
      ...DEFAULT_SIMPLE_INPUT,
      downPaymentPercent: 100,
    });
    expect(result.loanAmount).toBe(0);
    expect(result.principalAndInterest).toBe(0);
  });
});
