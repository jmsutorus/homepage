import { execute, query, queryOne } from "./index";

// ==================== Types ====================

export type FixedCostCategory =
  | 'housing' | 'utilities' | 'groceries' | 'transportation'
  | 'insurance' | 'healthcare' | 'childcare' | 'phone'
  | 'internet' | 'other';

export interface BudgetIncome {
  id: number;
  userId: string;
  amount: number;
  currency: string;
  label: string;
  effective_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetFixedCost {
  id: number;
  userId: string;
  name: string;
  category: FixedCostCategory;
  amount: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateIncomeInput {
  amount: number;
  currency?: string;
  label?: string;
  effective_date: string;
  notes?: string;
}

export interface UpdateIncomeInput {
  amount?: number;
  currency?: string;
  label?: string;
  effective_date?: string;
  notes?: string;
}

export interface CreateFixedCostInput {
  name: string;
  category?: FixedCostCategory;
  amount: number;
  currency?: string;
  notes?: string;
}

export interface UpdateFixedCostInput {
  name?: string;
  category?: FixedCostCategory;
  amount?: number;
  currency?: string;
  notes?: string;
}

// ==================== DB Row Types ====================

interface DBBudgetIncome {
  id: number;
  userId: string;
  amount: number;
  currency: string;
  label: string;
  effective_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DBBudgetFixedCost {
  id: number;
  userId: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== Transform ====================

function transformIncome(row: DBBudgetIncome): BudgetIncome {
  return { ...row };
}

function transformFixedCost(row: DBBudgetFixedCost): BudgetFixedCost {
  return {
    ...row,
    category: row.category as FixedCostCategory,
  };
}

// ==================== Income CRUD ====================

/**
 * Get all income sources for a user (most recent first)
 */
export async function getAllIncome(userId: string): Promise<BudgetIncome[]> {
  const rows = await query<DBBudgetIncome>(
    `SELECT * FROM budget_income WHERE userId = ? ORDER BY effective_date DESC`,
    [userId]
  );
  return rows.map(transformIncome);
}

/**
 * Get a single income source by ID
 */
export async function getIncome(id: number, userId: string): Promise<BudgetIncome | undefined> {
  const row = await queryOne<DBBudgetIncome>(
    `SELECT * FROM budget_income WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return row ? transformIncome(row) : undefined;
}

/**
 * Create a new income source
 */
export async function createIncome(input: CreateIncomeInput, userId: string): Promise<BudgetIncome> {
  const result = await execute(
    `INSERT INTO budget_income (userId, amount, currency, label, effective_date, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.amount,
      input.currency || 'USD',
      input.label || 'Primary',
      input.effective_date,
      input.notes || null,
    ]
  );

  const income = await queryOne<DBBudgetIncome>(
    `SELECT * FROM budget_income WHERE id = ?`,
    [result.lastInsertRowid]
  );

  if (!income) throw new Error('Failed to create income');
  return transformIncome(income);
}

/**
 * Update an income source
 */
export async function updateIncome(
  id: number,
  userId: string,
  updates: UpdateIncomeInput
): Promise<BudgetIncome | undefined> {
  const existing = await getIncome(id, userId);
  if (!existing) return undefined;

  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.amount !== undefined) { fields.push('amount = ?'); params.push(updates.amount); }
  if (updates.currency !== undefined) { fields.push('currency = ?'); params.push(updates.currency); }
  if (updates.label !== undefined) { fields.push('label = ?'); params.push(updates.label); }
  if (updates.effective_date !== undefined) { fields.push('effective_date = ?'); params.push(updates.effective_date); }
  if (updates.notes !== undefined) { fields.push('notes = ?'); params.push(updates.notes || null); }

  if (fields.length === 0) return existing;

  params.push(id, userId);
  await execute(
    `UPDATE budget_income SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
    params
  );

  return getIncome(id, userId);
}

/**
 * Delete an income source
 */
export async function deleteIncome(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    `DELETE FROM budget_income WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return result.changes > 0;
}

// ==================== Fixed Cost CRUD ====================

/**
 * Get all fixed costs for a user
 */
export async function getAllFixedCosts(userId: string): Promise<BudgetFixedCost[]> {
  const rows = await query<DBBudgetFixedCost>(
    `SELECT * FROM budget_fixed_costs WHERE userId = ? ORDER BY amount DESC`,
    [userId]
  );
  return rows.map(transformFixedCost);
}

/**
 * Get a single fixed cost by ID
 */
export async function getFixedCost(id: number, userId: string): Promise<BudgetFixedCost | undefined> {
  const row = await queryOne<DBBudgetFixedCost>(
    `SELECT * FROM budget_fixed_costs WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return row ? transformFixedCost(row) : undefined;
}

/**
 * Create a new fixed cost
 */
export async function createFixedCost(input: CreateFixedCostInput, userId: string): Promise<BudgetFixedCost> {
  const result = await execute(
    `INSERT INTO budget_fixed_costs (userId, name, category, amount, currency, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.name,
      input.category || 'other',
      input.amount,
      input.currency || 'USD',
      input.notes || null,
    ]
  );

  const cost = await queryOne<DBBudgetFixedCost>(
    `SELECT * FROM budget_fixed_costs WHERE id = ?`,
    [result.lastInsertRowid]
  );

  if (!cost) throw new Error('Failed to create fixed cost');
  return transformFixedCost(cost);
}

/**
 * Update a fixed cost
 */
export async function updateFixedCost(
  id: number,
  userId: string,
  updates: UpdateFixedCostInput
): Promise<BudgetFixedCost | undefined> {
  const existing = await getFixedCost(id, userId);
  if (!existing) return undefined;

  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); params.push(updates.name); }
  if (updates.category !== undefined) { fields.push('category = ?'); params.push(updates.category); }
  if (updates.amount !== undefined) { fields.push('amount = ?'); params.push(updates.amount); }
  if (updates.currency !== undefined) { fields.push('currency = ?'); params.push(updates.currency); }
  if (updates.notes !== undefined) { fields.push('notes = ?'); params.push(updates.notes || null); }

  if (fields.length === 0) return existing;

  params.push(id, userId);
  await execute(
    `UPDATE budget_fixed_costs SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
    params
  );

  return getFixedCost(id, userId);
}

/**
 * Delete a fixed cost
 */
export async function deleteFixedCost(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    `DELETE FROM budget_fixed_costs WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return result.changes > 0;
}
