export interface CalculatorStateSnapshot {
  homePrice: number;
  downPaymentAmount: number;
  interestRate: number;
  loanTermYears: 15 | 20 | 30;
  zipCode: string;
  monthlyPayment: number;
  loanAmount: number;
}

export const DEFAULT_CALCULATOR_STATE: CalculatorStateSnapshot = {
  homePrice: 425000,
  downPaymentAmount: 85_000,
  interestRate: 6.75,
  loanTermYears: 30,
  zipCode: '',
  monthlyPayment: 0,
  loanAmount: 0,
};
