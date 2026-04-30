import { execute, query, queryOne } from "./index";
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

// ==================== DB Row Types ====================

interface DBDebt {
  id: number;
  userId: string;
  name: string;
  category: string;
  original_amount: number;
  current_balance: number;
  interest_rate: number;
  monthly_payment: number;
  extra_payment: number;
  start_date: string | null;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DBDebtPayment {
  id: number;
  debtId: number;
  userId: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
}

// ==================== Transform ====================

function transformDebt(row: DBDebt): Debt {
  return {
    ...row,
    category: row.category as DebtCategory,
  };
}

function transformPayment(row: DBDebtPayment): DebtPayment {
  return { ...row };
}

// ==================== Debt CRUD ====================

/**
 * Get all debts for a user
 */
export async function getAllDebts(userId: string): Promise<Debt[]> {
  const rows = await query<DBDebt>(
    `SELECT * FROM debts WHERE userId = ? ORDER BY current_balance DESC`,
    [userId]
  );
  return rows.map(transformDebt);
}

/**
 * Get a single debt by ID
 */
export async function getDebt(id: number, userId: string): Promise<Debt | undefined> {
  const row = await queryOne<DBDebt>(
    `SELECT * FROM debts WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return row ? transformDebt(row) : undefined;
}

/**
 * Get a debt with all its payments and calculated fields
 */
export async function getDebtWithPayments(id: number, userId: string): Promise<DebtWithPayments | undefined> {
  const debt = await getDebt(id, userId);
  if (!debt) return undefined;

  const payments = await getPaymentsForDebt(id);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const percentPaid = debt.original_amount > 0
    ? Math.round(((debt.original_amount - debt.current_balance) / debt.original_amount) * 100)
    : 0;
  const projectedPayoffMonths = calculatePayoffMonths(
    debt.current_balance,
    debt.monthly_payment,
    debt.extra_payment,
    debt.interest_rate
  );

  return {
    ...debt,
    payments,
    totalPaid,
    percentPaid,
    projectedPayoffMonths,
  };
}

/**
 * Get all debts with calculated fields
 */
export async function getAllDebtsWithDetails(userId: string): Promise<DebtWithPayments[]> {
  const debts = await getAllDebts(userId);
  const result: DebtWithPayments[] = [];

  for (const debt of debts) {
    const payments = await getPaymentsForDebt(debt.id);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const percentPaid = debt.original_amount > 0
      ? Math.round(((debt.original_amount - debt.current_balance) / debt.original_amount) * 100)
      : 0;
    const projectedPayoffMonths = calculatePayoffMonths(
      debt.current_balance,
      debt.monthly_payment,
      debt.extra_payment,
      debt.interest_rate
    );

    result.push({
      ...debt,
      payments,
      totalPaid,
      percentPaid,
      projectedPayoffMonths,
    });
  }

  return result;
}

/**
 * Create a new debt
 */
export async function createDebt(input: CreateDebtInput, userId: string): Promise<Debt> {
  const result = await execute(
    `INSERT INTO debts (userId, name, category, original_amount, current_balance, interest_rate, monthly_payment, extra_payment, start_date, currency, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.name,
      input.category || 'other',
      input.original_amount,
      input.current_balance,
      input.interest_rate || 0,
      input.monthly_payment,
      input.extra_payment || 0,
      input.start_date || null,
      input.currency || 'USD',
      input.notes || null,
    ]
  );

  const debt = await queryOne<DBDebt>(
    `SELECT * FROM debts WHERE id = ?`,
    [result.lastInsertRowid]
  );

  if (!debt) throw new Error('Failed to create debt');
  return transformDebt(debt);
}

/**
 * Update a debt
 */
export async function updateDebt(
  id: number,
  userId: string,
  updates: UpdateDebtInput
): Promise<Debt | undefined> {
  const existing = await getDebt(id, userId);
  if (!existing) return undefined;

  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); params.push(updates.name); }
  if (updates.category !== undefined) { fields.push('category = ?'); params.push(updates.category); }
  if (updates.original_amount !== undefined) { fields.push('original_amount = ?'); params.push(updates.original_amount); }
  if (updates.current_balance !== undefined) { fields.push('current_balance = ?'); params.push(updates.current_balance); }
  if (updates.interest_rate !== undefined) { fields.push('interest_rate = ?'); params.push(updates.interest_rate); }
  if (updates.monthly_payment !== undefined) { fields.push('monthly_payment = ?'); params.push(updates.monthly_payment); }
  if (updates.extra_payment !== undefined) { fields.push('extra_payment = ?'); params.push(updates.extra_payment); }
  if (updates.start_date !== undefined) { fields.push('start_date = ?'); params.push(updates.start_date || null); }
  if (updates.currency !== undefined) { fields.push('currency = ?'); params.push(updates.currency); }
  if (updates.notes !== undefined) { fields.push('notes = ?'); params.push(updates.notes || null); }

  if (fields.length === 0) return existing;

  params.push(id, userId);
  await execute(
    `UPDATE debts SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
    params
  );

  return getDebt(id, userId);
}

/**
 * Delete a debt (cascade deletes payments)
 */
export async function deleteDebt(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    `DELETE FROM debts WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return result.changes > 0;
}

// ==================== Payment CRUD ====================

/**
 * Get all payments for a debt (most recent first)
 */
export async function getPaymentsForDebt(debtId: number): Promise<DebtPayment[]> {
  const rows = await query<DBDebtPayment>(
    `SELECT * FROM debt_payments WHERE debtId = ? ORDER BY date DESC`,
    [debtId]
  );
  return rows.map(transformPayment);
}

/**
 * Add a payment and update the debt's current balance
 */
export async function addPayment(input: CreatePaymentInput, userId: string): Promise<DebtPayment> {
  // Record the payment
  const result = await execute(
    `INSERT INTO debt_payments (debtId, userId, amount, date, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [input.debtId, userId, input.amount, input.date, input.notes || null]
  );

  // Decrease current balance
  await execute(
    `UPDATE debts SET current_balance = MAX(0, current_balance - ?) WHERE id = ? AND userId = ?`,
    [input.amount, input.debtId, userId]
  );

  const payment = await queryOne<DBDebtPayment>(
    `SELECT * FROM debt_payments WHERE id = ?`,
    [result.lastInsertRowid]
  );

  if (!payment) throw new Error('Failed to add payment');
  return transformPayment(payment);
}

/**
 * Delete a payment (does NOT restore balance — manual adjustment needed)
 */
export async function deletePayment(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    `DELETE FROM debt_payments WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return result.changes > 0;
}
