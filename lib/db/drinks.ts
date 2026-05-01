import { earthboundFetch } from "../api/earthbound";
import {
  type DrinkType,
  type DrinkStatus,
  type Drink,
  type DrinkLog,
  type DrinkWithLogs,
  type UpdateDrinkInput,
  type CreateDrinkInput,
  type CreateDrinkLogInput,
  type CalendarDrinkLog
} from "@jmsutorus/earthbound-shared";

export type {
  DrinkType,
  DrinkStatus,
  Drink,
  DrinkLog,
  DrinkWithLogs,
  CreateDrinkInput,
  CreateDrinkLogInput,
  UpdateDrinkInput,
  CalendarDrinkLog
};

// ==================== Drink CRUD ====================

/**
 * Get all drinks for a user
 */
export async function getAllDrinks(userId: string): Promise<Drink[]> {
  const res = await earthboundFetch(`/api/drinks?userId=${userId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.drinks;
}

/**
 * Get drinks with log count and last log date for card display
 */
export async function getAllDrinksWithLogCount(userId: string): Promise<(Drink & { logCount: number, lastLogDate: string | null })[]> {
  const res = await earthboundFetch(`/api/drinks?userId=${userId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.drinks;
}

/**
 * Get a drink by slug
 */
export async function getDrinkBySlug(slug: string, userId: string): Promise<Drink | undefined> {
  const res = await earthboundFetch(`/api/drinks/${slug}?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Get a drink with all its logs
 */
export async function getDrinkWithLogs(slug: string, userId: string): Promise<DrinkWithLogs | undefined> {
  const res = await earthboundFetch(`/api/drinks/${slug}?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Create a new drink
 */
export async function createDrink(input: CreateDrinkInput, userId: string): Promise<Drink> {
  const res = await earthboundFetch(`/api/drinks?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create drink');
  }

  return await res.json();
}

/**
 * Update a drink
 */
export async function updateDrink(
  slug: string,
  userId: string,
  updates: UpdateDrinkInput
): Promise<Drink | undefined> {
  const res = await earthboundFetch(`/api/drinks/${slug}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Delete a drink
 */
export async function deleteDrink(slug: string, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/drinks/${slug}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Check if a slug exists
 * Note: This is currently handled by the API's internal logic or can be a separate check
 */
export async function drinkSlugExists(slug: string, userId: string, _excludeId?: number): Promise<boolean> {
  const drink = await getDrinkBySlug(slug, userId);
  return !!drink;
}

// ==================== Drink Logs ====================

/**
 * Get all logs for a drink
 */
export async function getDrinkLogs(drinkId: number, userId: string): Promise<DrinkLog[]> {
  // Logs are typically fetched as part of getDrinkWithLogs, but if needed standalone:
  // Note: The API doesn't have a standalone GET /logs/drink/:id yet, 
  // but we can filter from the drink with logs response if necessary.
  // For now, we'll assume we fetch them via the drink.
  return []; 
}

/**
 * Get drink logs in a date range
 */
export async function getDrinkLogsInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<CalendarDrinkLog[]> {
  const res = await earthboundFetch(`/api/drinks/logs/range?userId=${userId}&start=${startDate}&end=${endDate}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Add a log to a drink
 */
export async function createLog(input: CreateDrinkLogInput, userId: string): Promise<DrinkLog> {
  const res = await earthboundFetch(`/api/drinks/logs?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create log');
  }

  return await res.json();
}

/**
 * Update a log
 */
export async function updateLog(
  id: number,
  userId: string,
  updates: { notes?: string; rating?: number; date?: string; location?: string }
): Promise<boolean> {
  const res = await earthboundFetch(`/api/drinks/logs/${id}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Delete a log
 */
export async function deleteLog(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/drinks/logs/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Get a single log
 */
export async function getLog(_id: number, _userId: string): Promise<DrinkLog | undefined> {
  // Not directly supported by current API endpoints as a standalone call
  return undefined;
}
