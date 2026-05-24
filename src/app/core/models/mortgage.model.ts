export interface SimpleCalculatorInput {
  homePrice: number;
  downPaymentPercent: number;
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

export const DEFAULT_SIMPLE_INPUT: SimpleCalculatorInput = {
  homePrice: 425000,
  downPaymentPercent: 20,
  interestRate: 6.75,
  loanTermYears: 30,
  propertyTaxAnnual: 5400,
  insuranceAnnual: 1800,
  pmiMonthly: 0,
  hoaMonthly: 0,
};
