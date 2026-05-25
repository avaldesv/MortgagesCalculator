export interface SimpleCalculatorInput {
  homePrice: number;
  /** Cash down payment in dollars (capped at home price). */
  downPaymentAmount: number;
  interestRate: number;
  loanTermYears: 15 | 20 | 30;
  propertyTaxAnnual: number;
  insuranceAnnual: number;
  pmiMonthly: number;
  hoaMonthly: number;
}

export interface PaymentBreakdownItem {
  key: string;
  label: string;
  monthly: number;
  percent: number;
  color: string;
}

export interface MortgageResult {
  loanAmount: number;
  principalAndInterest: number;
  propertyTaxMonthly: number;
  insuranceMonthly: number;
  pmiMonthly: number;
  hoaMonthly: number;
  monthlyPayment: number;
  totalInterest: number;
  payoffYear: number;
  breakdown: PaymentBreakdownItem[];
}

export interface AdvancedCalculatorInput extends SimpleCalculatorInput {
  extraMonthlyPayment: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPrincipal: number;
  balance: number;
}

export interface AmortizationYearSummary {
  year: number;
  principalPaid: number;
  interestPaid: number;
  endBalance: number;
}

export interface AdvancedCalculatorResult {
  mortgage: MortgageResult;
  schedule: AmortizationRow[];
  yearlySummary: AmortizationYearSummary[];
}

export const DEFAULT_SIMPLE_INPUT: SimpleCalculatorInput = {
  homePrice: 425000,
  downPaymentAmount: 85_000,
  interestRate: 6.75,
  loanTermYears: 30,
  propertyTaxAnnual: 5400,
  insuranceAnnual: 1800,
  pmiMonthly: 0,
  hoaMonthly: 0,
};

export const DEFAULT_ADVANCED_INPUT: AdvancedCalculatorInput = {
  ...DEFAULT_SIMPLE_INPUT,
  extraMonthlyPayment: 0,
};

export interface AffordabilityInput {
  annualGrossIncome: number;
  monthlyDebtPayments: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: 15 | 20 | 30;
  /** Annual property tax as % of home price */
  propertyTaxRatePercent: number;
  /** Annual insurance as % of home price */
  insuranceRatePercent: number;
  hoaMonthly: number;
  /** Housing payment to score (often from shared calculator state) */
  currentMonthlyHousing: number;
}

export type AffordabilityComfort = 'comfortable' | 'stretch' | 'over';

export interface AffordabilityResult {
  grossMonthlyIncome: number;
  frontEndDtiPercent: number;
  backEndDtiPercent: number;
  maxHousingPaymentFront: number;
  maxHousingPaymentBack: number;
  recommendedMaxPayment: number;
  affordableHomePrice: number;
  comfort: AffordabilityComfort;
  affordabilityScore: number;
}

export interface CompareScenarioRow {
  termYears: 15 | 20 | 30;
  label: string;
  mortgage: MortgageResult;
  /** Total interest saved vs 30-year baseline (0 for baseline row). */
  interestSavedVs30: number;
}

export interface CompareScenariosResult {
  input: SimpleCalculatorInput;
  rows: CompareScenarioRow[];
}

export const DEFAULT_AFFORDABILITY_INPUT: AffordabilityInput = {
  annualGrossIncome: 120_000,
  monthlyDebtPayments: 450,
  downPaymentPercent: 20,
  interestRate: 6.75,
  loanTermYears: 30,
  propertyTaxRatePercent: 1.27,
  insuranceRatePercent: 0.42,
  hoaMonthly: 0,
  currentMonthlyHousing: 0,
};
