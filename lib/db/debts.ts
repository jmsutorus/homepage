import { earthboundFetch } from "../api/earthbound";
import { calculatePayoffMonths, generatePayoffProjection } from "@/lib/utils/finances";

// Re-export for backwards compatibility
export { calculatePayoffMonths, generatePayoffProjection };

// ==================== Types ====================

import {
  type DebtCategory,
  type Debt,
  type DebtPayment,
  type DebtWithPayments,
  type UpdateDebtInput
} from "@jmsutorus/earthbound-shared";

export type {
  DebtCategory,
  Debt,
  DebtPayment,
  DebtWithPayments,
};

export interface CreateDebtInput {
  name: string;
  category?: DebtCategory;
  original_amount: number;
  current_balance: number;
  interest_rate?: number;
  monthly_payment: number;
  extra_payment?: number;
  start_date?: string;
  currency?: string;
  notes?: string;
}

export interface CreatePaymentInput {
  debtId: number;
  amount: number;
  date: string;
  notes?: string;
}

// ==================== Debt CRUD ====================

/**
 * Get all debts for a user
 */
export async function getAllDebts(userId: string): Promise<Debt[]> {
  const res = await earthboundFetch(`/api/debts?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get a single debt by ID
 */
export async function getDebt(id: number, userId: string): Promise<Debt | undefined> {
  const res = await earthboundFetch(`/api/debts/id/${id}?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Get a debt with all its payments and calculated fields
 */
export async function getDebtWithPayments(id: number, userId: string): Promise<DebtWithPayments | undefined> {
  const res = await earthboundFetch(`/api/debts/id/${id}/full?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Get all debts with calculated fields
 */
export async function getAllDebtsWithDetails(userId: string): Promise<DebtWithPayments[]> {
  const res = await earthboundFetch(`/api/debts/details?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Create a new debt
 */
export async function createDebt(input: CreateDebtInput, userId: string): Promise<Debt> {
  const res = await earthboundFetch(`/api/debts?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create debt');
  }

  return await res.json();
}

/**
 * Update a debt
 */
export async function updateDebt(
  id: number,
  userId: string,
  updates: UpdateDebtInput
): Promise<Debt | undefined> {
  const res = await earthboundFetch(`/api/debts/id/${id}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Delete a debt (cascade deletes payments)
 */
export async function deleteDebt(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/debts/id/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

// ==================== Payment CRUD ====================

/**
 * Get all payments for a debt (most recent first)
 */
export async function getPaymentsForDebt(debtId: number): Promise<DebtPayment[]> {
  const res = await earthboundFetch(`/api/debts/id/${debtId}/payments`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Add a payment and update the debt's current balance
 */
export async function addPayment(input: CreatePaymentInput, userId: string): Promise<DebtPayment> {
  const res = await earthboundFetch(`/api/debts/payments?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to add payment');
  }

  return await res.json();
}

/**
 * Delete a payment (does NOT restore balance — manual adjustment needed)
 */
export async function deletePayment(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/debts/payments/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}
