import { execute, query, queryOne } from "./index";

// ==================== Types ====================

import {
  type SavingsAccountType,
  type SavingsAccount,
  type SavingsBalance,
  type SavingsAccountWithBalance,
} from "@jmsutorus/earthbound-shared";

export type {
  SavingsAccountType,
  SavingsAccount,
  SavingsBalance,
  SavingsAccountWithBalance,
};

export interface CreateSavingsAccountInput {
  name: string;
  institution?: string;
  account_type?: SavingsAccountType;
  currency?: string;
  notes?: string;
}

export interface UpdateSavingsAccountInput {
  name?: string;
  institution?: string;
  account_type?: SavingsAccountType;
  currency?: string;
  notes?: string;
}

export interface CreateBalanceInput {
  accountId: number;
  balance: number;
  date: string;
}

// ==================== DB Row Types ====================

interface DBSavingsAccount {
  id: number;
  userId: string;
  name: string;
  institution: string | null;
  account_type: string;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DBSavingsBalance {
  id: number;
  accountId: number;
  userId: string;
  balance: number;
  date: string;
  created_at: string;
}

// ==================== Transform ====================

function transformAccount(row: DBSavingsAccount): SavingsAccount {
  return {
    ...row,
    account_type: row.account_type as SavingsAccountType,
  };
}

function transformBalance(row: DBSavingsBalance): SavingsBalance {
  return { ...row };
}

// ==================== Account CRUD ====================

/**
 * Get all savings accounts for a user
 */
export async function getAllSavingsAccounts(userId: string): Promise<SavingsAccount[]> {
  const rows = await query<DBSavingsAccount>(
    `SELECT * FROM savings_accounts WHERE userId = ? ORDER BY name ASC`,
    [userId]
  );
  return rows.map(transformAccount);
}

/**
 * Get all savings accounts with their latest balance
 */
export async function getAllSavingsAccountsWithBalance(userId: string): Promise<SavingsAccountWithBalance[]> {
  const accounts = await getAllSavingsAccounts(userId);
  const result: SavingsAccountWithBalance[] = [];

  for (const account of accounts) {
    const balances = await getBalancesForAccount(account.id);
    const currentBalance = balances.length > 0 ? balances[0].balance : null;
    result.push({
      ...account,
      currentBalance,
      balances,
    });
  }

  return result;
}

/**
 * Get a single savings account by ID
 */
export async function getSavingsAccount(id: number, userId: string): Promise<SavingsAccount | undefined> {
  const row = await queryOne<DBSavingsAccount>(
    `SELECT * FROM savings_accounts WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return row ? transformAccount(row) : undefined;
}

/**
 * Get a savings account with all its balance history
 */
export async function getSavingsAccountWithBalances(id: number, userId: string): Promise<SavingsAccountWithBalance | undefined> {
  const account = await getSavingsAccount(id, userId);
  if (!account) return undefined;

  const balances = await getBalancesForAccount(id);
  const currentBalance = balances.length > 0 ? balances[0].balance : null;

  return {
    ...account,
    currentBalance,
    balances,
  };
}

/**
 * Create a new savings account
 */
export async function createSavingsAccount(input: CreateSavingsAccountInput, userId: string): Promise<SavingsAccount> {
  const result = await execute(
    `INSERT INTO savings_accounts (userId, name, institution, account_type, currency, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.name,
      input.institution || null,
      input.account_type || 'savings',
      input.currency || 'USD',
      input.notes || null,
    ]
  );

  const account = await queryOne<DBSavingsAccount>(
    `SELECT * FROM savings_accounts WHERE id = ?`,
    [result.lastInsertRowid]
  );

  if (!account) throw new Error('Failed to create savings account');
  return transformAccount(account);
}

/**
 * Update a savings account
 */
export async function updateSavingsAccount(
  id: number,
  userId: string,
  updates: UpdateSavingsAccountInput
): Promise<SavingsAccount | undefined> {
  const existing = await getSavingsAccount(id, userId);
  if (!existing) return undefined;

  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    params.push(updates.name);
  }
  if (updates.institution !== undefined) {
    fields.push('institution = ?');
    params.push(updates.institution || null);
  }
  if (updates.account_type !== undefined) {
    fields.push('account_type = ?');
    params.push(updates.account_type);
  }
  if (updates.currency !== undefined) {
    fields.push('currency = ?');
    params.push(updates.currency);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    params.push(updates.notes || null);
  }

  if (fields.length === 0) return existing;

  params.push(id, userId);
  await execute(
    `UPDATE savings_accounts SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
    params
  );

  return getSavingsAccount(id, userId);
}

/**
 * Delete a savings account (cascade deletes balances)
 */
export async function deleteSavingsAccount(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    `DELETE FROM savings_accounts WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return result.changes > 0;
}

// ==================== Balance CRUD ====================

/**
 * Get all balances for an account (most recent first)
 */
export async function getBalancesForAccount(accountId: number): Promise<SavingsBalance[]> {
  const rows = await query<DBSavingsBalance>(
    `SELECT * FROM savings_balances WHERE accountId = ? ORDER BY date DESC`,
    [accountId]
  );
  return rows.map(transformBalance);
}

/**
 * Get all balance history across all accounts for a user (for charts)
 */
export async function getAllBalanceHistory(userId: string): Promise<(SavingsBalance & { accountName: string })[]> {
  const rows = await query<DBSavingsBalance & { accountName: string }>(
    `SELECT sb.*, sa.name as accountName
     FROM savings_balances sb
     JOIN savings_accounts sa ON sb.accountId = sa.id
     WHERE sb.userId = ?
     ORDER BY sb.date ASC`,
    [userId]
  );
  return rows.map(row => ({
    ...transformBalance(row),
    accountName: row.accountName,
  }));
}

/**
 * Add a balance snapshot
 */
export async function addBalance(input: CreateBalanceInput, userId: string): Promise<SavingsBalance> {
  const result = await execute(
    `INSERT INTO savings_balances (accountId, userId, balance, date)
     VALUES (?, ?, ?, ?)`,
    [input.accountId, userId, input.balance, input.date]
  );

  const balance = await queryOne<DBSavingsBalance>(
    `SELECT * FROM savings_balances WHERE id = ?`,
    [result.lastInsertRowid]
  );

  if (!balance) throw new Error('Failed to add balance');
  return transformBalance(balance);
}

/**
 * Delete a balance entry
 */
export async function deleteBalance(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    `DELETE FROM savings_balances WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return result.changes > 0;
}
