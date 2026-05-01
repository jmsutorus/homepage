import { earthboundFetch } from "../api/earthbound";

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

// ==================== Account CRUD ====================

/**
 * Get all savings accounts for a user
 */
export async function getAllSavingsAccounts(userId: string): Promise<SavingsAccount[]> {
  const res = await earthboundFetch(`/api/savings/accounts?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get all savings accounts with their latest balance
 */
export async function getAllSavingsAccountsWithBalance(userId: string): Promise<SavingsAccountWithBalance[]> {
  const res = await earthboundFetch(`/api/savings/accounts/with-balance?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get a single savings account by ID
 */
export async function getSavingsAccount(id: number, userId: string): Promise<SavingsAccount | undefined> {
  const res = await earthboundFetch(`/api/savings/accounts/id/${id}?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Get a savings account with all its balance history
 */
export async function getSavingsAccountWithBalances(id: number, userId: string): Promise<SavingsAccountWithBalance | undefined> {
  const res = await earthboundFetch(`/api/savings/accounts/id/${id}/full?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Create a new savings account
 */
export async function createSavingsAccount(input: CreateSavingsAccountInput, userId: string): Promise<SavingsAccount> {
  const res = await earthboundFetch(`/api/savings/accounts?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create savings account');
  }

  return await res.json();
}

/**
 * Update a savings account
 */
export async function updateSavingsAccount(
  id: number,
  userId: string,
  updates: UpdateSavingsAccountInput
): Promise<SavingsAccount | undefined> {
  const res = await earthboundFetch(`/api/savings/accounts/id/${id}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Delete a savings account (cascade deletes balances)
 */
export async function deleteSavingsAccount(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/savings/accounts/id/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

// ==================== Balance CRUD ====================

/**
 * Get all balances for an account (most recent first)
 */
export async function getBalancesForAccount(accountId: number): Promise<SavingsBalance[]> {
  // Standalone balance fetch for account ID not directly in API base but part of full account fetch
  // If needed, we could implement a direct endpoint in the API.
  // For now, return empty or implement.
  return [];
}

/**
 * Get all balance history across all accounts for a user (for charts)
 */
export async function getAllBalanceHistory(userId: string): Promise<(SavingsBalance & { accountName: string })[]> {
  const res = await earthboundFetch(`/api/savings/history?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Add a balance snapshot
 */
export async function addBalance(input: CreateBalanceInput, userId: string): Promise<SavingsBalance> {
  const res = await earthboundFetch(`/api/savings/balances?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to add balance');
  }

  return await res.json();
}

/**
 * Delete a balance entry
 */
export async function deleteBalance(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/savings/balances/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}
