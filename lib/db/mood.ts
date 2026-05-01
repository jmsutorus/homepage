import { earthboundFetch } from "../api/earthbound";

import {
  type MoodEntry,
} from "@jmsutorus/earthbound-shared";

export type {
  MoodEntry,
};

/**
 * Create a new mood entry
 */
export async function createMoodEntry(
  date: string,
  rating: number,
  note: string | undefined,
  userId: string
): Promise<MoodEntry> {
  const response = await earthboundFetch(`/api/mood?userId=${userId}`, {
    method: "POST",
    body: JSON.stringify({ date, rating, note }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create mood entry: ${response.statusText}`);
  }

  return response.json() as Promise<MoodEntry>;
}

/**
 * Get mood entry for a specific date
 */
export async function getMoodEntry(date: string, userId: string): Promise<MoodEntry | undefined> {
  const response = await earthboundFetch(`/api/mood/date/${date}?userId=${userId}`);
  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error(`Failed to fetch mood entry: ${response.statusText}`);
  }
  return response.json() as Promise<MoodEntry>;
}

/**
 * Get mood entries in a date range
 */
export async function getMoodEntriesInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<MoodEntry[]> {
  const response = await earthboundFetch(`/api/mood/range?userId=${userId}&start=${startDate}&end=${endDate}`);
  if (!response.ok) throw new Error(`Failed to fetch mood entries in range: ${response.statusText}`);
  return response.json() as Promise<MoodEntry[]>;
}

/**
 * Get all mood entries
 */
export async function getAllMoodEntries(userId: string): Promise<MoodEntry[]> {
  const response = await earthboundFetch(`/api/mood?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch all mood entries: ${response.statusText}`);
  return response.json() as Promise<MoodEntry[]>;
}

/**
 * Get mood entries for current year
 */
export async function getMoodEntriesForYear(year: number, userId: string): Promise<MoodEntry[]> {
  const response = await earthboundFetch(`/api/mood/year/${year}?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch mood entries for year: ${response.statusText}`);
  return response.json() as Promise<MoodEntry[]>;
}

/**
 * Update mood entry
 */
export async function updateMoodEntry(
  date: string,
  rating: number,
  note: string | undefined,
  userId: string
): Promise<boolean> {
  const response = await earthboundFetch(`/api/mood/date/${date}?userId=${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ rating, note }),
  });

  if (!response.ok) {
    if (response.status === 404) return false;
    throw new Error(`Failed to update mood entry: ${response.statusText}`);
  }

  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Delete mood entry
 */
export async function deleteMoodEntry(date: string, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/mood/date/${date}?userId=${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    if (response.status === 404) return false;
    throw new Error(`Failed to delete mood entry: ${response.statusText}`);
  }

  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Get mood statistics
 */
export async function getMoodStatistics(userId: string): Promise<{
  total: number;
  average: number;
  byRating: Record<number, number>;
}> {
  const response = await earthboundFetch(`/api/mood/stats?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch mood statistics: ${response.statusText}`);
  return response.json() as Promise<{
    total: number;
    average: number;
    byRating: Record<number, number>;
  }>;
}
