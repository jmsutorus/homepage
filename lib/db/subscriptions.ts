import { execute, query, queryOne } from "./index";
import { toMonthly, toYearly } from "@/lib/utils/finances";
import type { SubscriptionCycle } from "@/lib/utils/finances";

// Re-export for backwards compatibility
export { toMonthly, toYearly };
export type { SubscriptionCycle };

// ==================== Types ====================

export interface Subscription {
  id: number;
  userId: string;
  name: string;
  website: string | null;
  icon_url: string | null;
  price: number;
  cycle: SubscriptionCycle;
  currency: string;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionInput {
  name: string;
  website?: string;
  icon_url?: string;
  price: number;
  cycle?: SubscriptionCycle;
  currency?: string;
  active?: boolean;
  notes?: string;
}

export interface UpdateSubscriptionInput {
  name?: string;
  website?: string;
  icon_url?: string;
  price?: number;
  cycle?: SubscriptionCycle;
  currency?: string;
  active?: boolean;
  notes?: string;
}

export interface SubscriptionTotals {
  currency: string;
  monthly: number;
  yearly: number;
  count: number;
}

// ==================== DB Row Type ====================

interface DBSubscription {
  id: number;
  userId: string;
  name: string;
  website: string | null;
  icon_url: string | null;
  price: number;
  cycle: string;
  currency: string;
  active: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== Transform ====================

function transformSubscription(row: DBSubscription): Subscription {
  return {
    ...row,
    active: Boolean(row.active),
    cycle: row.cycle as SubscriptionCycle,
  };
}


// ==================== CRUD ====================

/**
 * Get all subscriptions for a user
 */
export async function getAllSubscriptions(userId: string): Promise<Subscription[]> {
  const rows = await query<DBSubscription>(
    `SELECT * FROM subscriptions WHERE userId = ? ORDER BY name ASC`,
    [userId]
  );
  return rows.map(transformSubscription);
}

/**
 * Get a single subscription by ID
 */
export async function getSubscription(id: number, userId: string): Promise<Subscription | undefined> {
  const row = await queryOne<DBSubscription>(
    `SELECT * FROM subscriptions WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return row ? transformSubscription(row) : undefined;
}

/**
 * Create a new subscription
 */
export async function createSubscription(input: CreateSubscriptionInput, userId: string): Promise<Subscription> {
  // If website is provided, generate favicon URL
  let iconUrl = input.icon_url || null;
  if (input.website && !iconUrl) {
    try {
      const url = new URL(input.website);
      iconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
    } catch {
      // Invalid URL, skip favicon
    }
  }

  const result = await execute(
    `INSERT INTO subscriptions (userId, name, website, icon_url, price, cycle, currency, active, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.name,
      input.website || null,
      iconUrl,
      input.price,
      input.cycle || 'monthly',
      input.currency || 'USD',
      input.active !== false ? 1 : 0,
      input.notes || null,
    ]
  );

  const sub = await queryOne<DBSubscription>(
    `SELECT * FROM subscriptions WHERE id = ?`,
    [result.lastInsertRowid]
  );

  if (!sub) throw new Error('Failed to create subscription');
  return transformSubscription(sub);
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  id: number,
  userId: string,
  updates: UpdateSubscriptionInput
): Promise<Subscription | undefined> {
  const existing = await getSubscription(id, userId);
  if (!existing) return undefined;

  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    params.push(updates.name);
  }
  if (updates.website !== undefined) {
    fields.push('website = ?');
    params.push(updates.website || null);
    // Update icon if website changes
    let iconUrl: string | null = null;
    if (updates.website) {
      try {
        const url = new URL(updates.website);
        iconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
      } catch { /* skip */ }
    }
    fields.push('icon_url = ?');
    params.push(updates.icon_url ?? iconUrl);
  } else if (updates.icon_url !== undefined) {
    fields.push('icon_url = ?');
    params.push(updates.icon_url || null);
  }
  if (updates.price !== undefined) {
    fields.push('price = ?');
    params.push(updates.price);
  }
  if (updates.cycle !== undefined) {
    fields.push('cycle = ?');
    params.push(updates.cycle);
  }
  if (updates.currency !== undefined) {
    fields.push('currency = ?');
    params.push(updates.currency);
  }
  if (updates.active !== undefined) {
    fields.push('active = ?');
    params.push(updates.active ? 1 : 0);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    params.push(updates.notes || null);
  }

  if (fields.length === 0) return existing;

  params.push(id, userId);
  await execute(
    `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
    params
  );

  return getSubscription(id, userId);
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    `DELETE FROM subscriptions WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return result.changes > 0;
}

/**
 * Get subscription cost totals grouped by currency
 */
export async function getSubscriptionTotals(userId: string): Promise<SubscriptionTotals[]> {
  const subs = await getAllSubscriptions(userId);
  const activeSubs = subs.filter(s => s.active);

  // Group by currency
  const byCurrency = new Map<string, { monthly: number; yearly: number; count: number }>();

  for (const sub of activeSubs) {
    const currency = sub.currency;
    const current = byCurrency.get(currency) || { monthly: 0, yearly: 0, count: 0 };
    current.monthly += toMonthly(sub.price, sub.cycle);
    current.yearly += toYearly(sub.price, sub.cycle);
    current.count += 1;
    byCurrency.set(currency, current);
  }

  return Array.from(byCurrency.entries()).map(([currency, data]) => ({
    currency,
    monthly: Math.round(data.monthly * 100) / 100,
    yearly: Math.round(data.yearly * 100) / 100,
    count: data.count,
  }));
}
