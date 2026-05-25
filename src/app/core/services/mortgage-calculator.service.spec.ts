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

  it('estimatePmiMonthly matches loan * 0.5% annual / 12 when down < 20%', () => {
    expect(service.estimatePmiMonthly(360_000, 10)).toBeCloseTo(150, 6);
    expect(service.estimatePmiMonthly(382_500, 10)).toBeCloseTo(159.375, 6);
  });

  it('estimatePmiMonthly is zero at 20% down or above', () => {
    expect(service.estimatePmiMonthly(340_000, 20)).toBe(0);
    expect(service.estimatePmiMonthly(340_000, 25)).toBe(0);
    expect(service.estimatePmiMonthly(0, 5)).toBe(0);
  });

  it('auto-calculates PMI when down payment is under 20% and ignores manual input', () => {
    const result = service.calculateSimple({
      ...DEFAULT_SIMPLE_INPUT,
      homePrice: 400_000,
      downPaymentPercent: 10,
      pmiMonthly: 999,
    });
    expect(result.loanAmount).toBe(360_000);
    expect(result.pmiMonthly).toBeCloseTo(150, 2);
    expect(result.breakdown.find((b) => b.key === 'pmi')?.monthly).toBeCloseTo(150, 2);
    const withoutPmi =
      result.monthlyPayment -
      result.principalAndInterest -
      result.propertyTaxMonthly -
      result.insuranceMonthly -
      result.hoaMonthly;
    expect(withoutPmi).toBeCloseTo(150, 2);
  });

  it('default simple input (20% down) shows zero PMI', () => {
    const result = service.calculateSimple(DEFAULT_SIMPLE_INPUT);
    expect(result.loanAmount).toBe(340_000);
    expect(result.pmiMonthly).toBe(0);
    expect(result.breakdown.some((b) => b.key === 'pmi')).toBe(false);
  });

  it('425k home with 10% down yields ~$159.38/mo PMI', () => {
    const result = service.calculateSimple({
      ...DEFAULT_SIMPLE_INPUT,
      homePrice: 425_000,
      downPaymentPercent: 10,
    });
    expect(result.loanAmount).toBe(382_500);
    expect(result.pmiMonthly).toBeCloseTo(159.38, 2);
  });

  it('sets PMI to zero when down payment is 20% or more', () => {
    const result = service.calculateSimple({
      ...DEFAULT_SIMPLE_INPUT,
      downPaymentPercent: 20,
      pmiMonthly: 999,
    });
    expect(result.pmiMonthly).toBe(0);
    expect(result.breakdown.some((b) => b.key === 'pmi')).toBe(false);
  });

  it('advanced calculator uses the same auto PMI as simple', () => {
    const input = {
      ...DEFAULT_SIMPLE_INPUT,
      homePrice: 425_000,
      downPaymentPercent: 10,
      extraMonthlyPayment: 100,
    };
    const advanced = service.calculateAdvanced(input);
    const simple = service.calculateSimple(input);
    expect(advanced.mortgage.pmiMonthly).toBe(simple.pmiMonthly);
    expect(advanced.mortgage.pmiMonthly).toBeCloseTo(159.38, 2);
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

  it('shows lower total interest for shorter loan terms', () => {
    const { rows } = service.compareScenarios({
      ...DEFAULT_SIMPLE_INPUT,
      homePrice: 400_000,
      downPaymentPercent: 20,
      interestRate: 6.5,
    });
    const r15 = rows.find((r) => r.termYears === 15)!;
    const r30 = rows.find((r) => r.termYears === 30)!;
    expect(r15.mortgage.totalInterest).toBeLessThan(r30.mortgage.totalInterest);
    expect(r15.interestSavedVs30).toBeGreaterThan(0);
    expect(r30.interestSavedVs30).toBe(0);
  });

  it('estimates home price from target monthly payment', () => {
    const price = service.estimateHomePriceFromMonthlyPayment(
      2500,
      {
        downPaymentPercent: 20,
        interestRate: 6.75,
        loanTermYears: 30,
        hoaMonthly: 0,
      },
    );
    const check = service.calculateSimple({
      homePrice: price,
      downPaymentPercent: 20,
      interestRate: 6.75,
      loanTermYears: 30,
      propertyTaxAnnual: price * 0.0127,
      insuranceAnnual: price * 0.0042,
      pmiMonthly: 0,
      hoaMonthly: 0,
    });
    expect(check.monthlyPayment).toBeLessThanOrEqual(2500 + 5);
    expect(price).toBeGreaterThan(200_000);
  });
});
