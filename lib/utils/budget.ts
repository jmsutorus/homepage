/**
 * Client-safe budget calculation utilities.
 * No db/Node.js dependencies — safe for client components.
 */

export interface BudgetBreakdown {
  totalIncome: number;
  subscriptionsCost: number;
  debtPayments: number;
  fixedCosts: number;
  totalExpenses: number;
  discretionary: number;
  savingsRate: number;
  /** Percentage of income for each category */
  percentages: {
    subscriptions: number;
    debts: number;
    fixedCosts: number;
    discretionary: number;
  };
}

export interface Rule503020 {
  needs: { actual: number; recommended: number; percent: number };
  wants: { actual: number; recommended: number; percent: number };
  savings: { actual: number; recommended: number; percent: number };
}

/**
 * Calculate full budget breakdown
 */
export function calculateBudgetBreakdown(
  totalIncome: number,
  subscriptionsCost: number,
  debtPayments: number,
  fixedCosts: number
): BudgetBreakdown {
  const totalExpenses = subscriptionsCost + debtPayments + fixedCosts;
  const discretionary = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10
    : 0;

  const pct = (val: number) => totalIncome > 0
    ? Math.round((val / totalIncome) * 1000) / 10
    : 0;

  return {
    totalIncome,
    subscriptionsCost,
    debtPayments,
    fixedCosts,
    totalExpenses,
    discretionary,
    savingsRate,
    percentages: {
      subscriptions: pct(subscriptionsCost),
      debts: pct(debtPayments),
      fixedCosts: pct(fixedCosts),
      discretionary: pct(discretionary),
    },
  };
}

/**
 * Compare spending against the 50/30/20 rule:
 * - 50% Needs (fixed costs + subscriptions essentials)
 * - 30% Wants (discretionary)
 * - 20% Savings & Debt repayment
 *
 * For simplicity: needs = fixedCosts + subscriptions, wants = discretionary, savings = debt payments + leftover
 */
export function calculate503020(
  totalIncome: number,
  fixedCosts: number,
  subscriptionsCost: number,
  debtPayments: number
): Rule503020 {
  const needsActual = fixedCosts + subscriptionsCost;
  const savingsActual = debtPayments;
  const wantsActual = Math.max(0, totalIncome - needsActual - savingsActual);

  const pct = (val: number) => totalIncome > 0
    ? Math.round((val / totalIncome) * 1000) / 10
    : 0;

  return {
    needs: {
      actual: needsActual,
      recommended: totalIncome * 0.5,
      percent: pct(needsActual),
    },
    wants: {
      actual: wantsActual,
      recommended: totalIncome * 0.3,
      percent: pct(wantsActual),
    },
    savings: {
      actual: savingsActual,
      recommended: totalIncome * 0.2,
      percent: pct(savingsActual),
    },
  };
}

/**
 * Get a color class based on savings rate
 */
export function getSavingsRateColor(rate: number): string {
  if (rate >= 20) return 'text-emerald-500';
  if (rate >= 10) return 'text-yellow-500';
  return 'text-destructive';
}

/**
 * Get a label for savings rate health
 */
export function getSavingsRateLabel(rate: number): string {
  if (rate >= 30) return 'Excellent';
  if (rate >= 20) return 'Great';
  if (rate >= 10) return 'Fair';
  if (rate >= 0) return 'Tight';
  return 'Over Budget';
}
