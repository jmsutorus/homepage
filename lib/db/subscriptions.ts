import { earthboundFetch } from "../api/earthbound";
import { toMonthly, toYearly } from "@/lib/utils/finances";
import type { SubscriptionCycle } from "@/lib/utils/finances";

// Re-export for backwards compatibility
export { toMonthly, toYearly };
export type { SubscriptionCycle };

// ==================== Types ====================

import {
  type Subscription,
  type SubscriptionTotals,
} from "@jmsutorus/earthbound-shared";

export type {
  Subscription,
  SubscriptionTotals,
};

export interface CreateSubscriptionInput {
  name: string;
  website?: string;
  icon_url?: string;
  price: number;
  cycle: string;
  currency: string;
  active?: boolean;
  category?: string;
  billing_day?: number;
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
  category?: string;
  billing_day?: number;
  notes?: string;
}

// ==================== CRUD ====================

/**
 * Get all subscriptions for a user
 */
export async function getAllSubscriptions(userId: string): Promise<Subscription[]> {
  const res = await earthboundFetch(`/api/subscriptions?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get a single subscription by ID
 */
export async function getSubscription(id: number, userId: string): Promise<Subscription | undefined> {
  const res = await earthboundFetch(`/api/subscriptions/id/${id}?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Create a new subscription
 */
export async function createSubscription(input: CreateSubscriptionInput, userId: string): Promise<Subscription> {
  const res = await earthboundFetch(`/api/subscriptions?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create subscription');
  }

  return await res.json();
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  id: number,
  userId: string,
  updates: UpdateSubscriptionInput
): Promise<Subscription | undefined> {
  const res = await earthboundFetch(`/api/subscriptions/id/${id}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/subscriptions/id/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Get subscription cost totals grouped by currency
 */
export async function getSubscriptionTotals(userId: string): Promise<SubscriptionTotals[]> {
  const res = await earthboundFetch(`/api/subscriptions/totals?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}
