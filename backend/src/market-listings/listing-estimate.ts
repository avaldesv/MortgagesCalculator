/** Shared P&I estimate for market listing cards (educational). */
export function estimateMonthlyPayment(
  price: number,
  downPercent = 20,
  annualRate = 7,
  years = 30,
): number {
  const loan = price * (1 - downPercent / 100);
  if (loan <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return loan / n;
  return (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}
