import { TestBed } from '@angular/core/testing';
import { DEFAULT_AFFORDABILITY_INPUT, DEFAULT_SIMPLE_INPUT } from '../models/mortgage.model';
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

  it('builds amortization schedule that pays off loan', () => {
    const mortgage = service.calculateSimple({
      ...DEFAULT_SIMPLE_INPUT,
      homePrice: 400_000,
      downPaymentPercent: 20,
      interestRate: 6.75,
      loanTermYears: 30,
      propertyTaxAnnual: 0,
      insuranceAnnual: 0,
      pmiMonthly: 0,
      hoaMonthly: 0,
    });
    const schedule = service.buildAmortizationSchedule(
      mortgage.loanAmount,
      6.75,
      30,
      mortgage.principalAndInterest,
      0,
    );
    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule[schedule.length - 1].balance).toBeLessThan(1);
    const totalPrincipal = schedule.reduce((s, r) => s + r.principal + r.extraPrincipal, 0);
    expect(totalPrincipal).toBeCloseTo(mortgage.loanAmount, 0);
  });

  it('shortens payoff with extra monthly payment', () => {
    const mortgage = service.calculateSimple({
      ...DEFAULT_SIMPLE_INPUT,
      homePrice: 250_000,
      downPaymentPercent: 20,
      interestRate: 6,
      loanTermYears: 30,
      propertyTaxAnnual: 0,
      insuranceAnnual: 0,
      pmiMonthly: 0,
      hoaMonthly: 0,
    });
    const base = service.buildAmortizationSchedule(
      mortgage.loanAmount,
      6,
      30,
      mortgage.principalAndInterest,
      0,
    );
    const extra = service.buildAmortizationSchedule(
      mortgage.loanAmount,
      6,
      30,
      mortgage.principalAndInterest,
      200,
    );
    expect(extra.length).toBeLessThan(base.length);
  });

  it('caps affordable payment at 28% front-end and 36% back-end DTI', () => {
    const result = service.calculateAffordability({
      ...DEFAULT_AFFORDABILITY_INPUT,
      annualGrossIncome: 96_000,
      monthlyDebtPayments: 400,
      currentMonthlyHousing: 0,
    });
    expect(result.maxHousingPaymentFront).toBeCloseTo(2240, 0);
    expect(result.maxHousingPaymentBack).toBeCloseTo(2480, 0);
    expect(result.recommendedMaxPayment).toBe(2240);
  });

  it('returns a positive affordable home price when income supports it', () => {
    const result = service.calculateAffordability(DEFAULT_AFFORDABILITY_INPUT);
    expect(result.affordableHomePrice).toBeGreaterThan(100_000);
    expect(result.affordabilityScore).toBeGreaterThan(0);
  });
});
