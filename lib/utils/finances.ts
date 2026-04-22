/**
 * Pure utility functions for finance calculations.
 * Safe to import in client components (no db/Node.js dependencies).
 */

// ==================== Subscription Cycle Helpers ====================

export type SubscriptionCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/** Convert any cycle price to monthly equivalent */
export function toMonthly(price: number, cycle: SubscriptionCycle): number {
  switch (cycle) {
    case 'weekly': return price * (52 / 12);
    case 'monthly': return price;
    case 'quarterly': return price / 3;
    case 'yearly': return price / 12;
  }
}

/** Convert any cycle price to yearly equivalent */
export function toYearly(price: number, cycle: SubscriptionCycle): number {
  switch (cycle) {
    case 'weekly': return price * 52;
    case 'monthly': return price * 12;
    case 'quarterly': return price * 4;
    case 'yearly': return price;
  }
}

// ==================== Debt Projection Helpers ====================

/**
 * Calculate months until payoff using amortization
 * Returns null if the payment doesn't cover interest (will never pay off)
 */
export function calculatePayoffMonths(
  balance: number,
  monthlyPayment: number,
  extraPayment: number,
  annualRate: number
): number | null {
  if (balance <= 0) return 0;

  const totalMonthlyPayment = monthlyPayment + extraPayment;
  if (totalMonthlyPayment <= 0) return null;

  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) {
    return Math.ceil(balance / totalMonthlyPayment);
  }

  const monthlyInterest = balance * monthlyRate;
  if (totalMonthlyPayment <= monthlyInterest) {
    return null; // Payment doesn't cover interest
  }

  // Amortization formula: n = -log(1 - (r * PV / PMT)) / log(1 + r)
  const n = -Math.log(1 - (monthlyRate * balance) / totalMonthlyPayment) / Math.log(1 + monthlyRate);
  return Math.ceil(n);
}

/**
 * Generate projected balance over time for chart visualization
 */
export function generatePayoffProjection(
  balance: number,
  monthlyPayment: number,
  extraPayment: number,
  annualRate: number,
  maxMonths: number = 360
): { month: number; balance: number }[] {
  const points: { month: number; balance: number }[] = [{ month: 0, balance }];
  const totalPayment = monthlyPayment + extraPayment;
  const monthlyRate = annualRate / 100 / 12;
  let remaining = balance;

  for (let m = 1; m <= maxMonths && remaining > 0; m++) {
    const interest = remaining * monthlyRate;
    remaining = Math.max(0, remaining + interest - totalPayment);
    points.push({ month: m, balance: Math.round(remaining * 100) / 100 });
  }

  return points;
}
