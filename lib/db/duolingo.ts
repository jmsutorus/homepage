import { earthboundFetch } from "../api/earthbound";
import {
  type DuolingoCompletion,
} from "@jmsutorus/earthbound-shared";

/**
 * Check if user has completed their Duolingo lesson for a specific date
 */
export async function getDuolingoCompletion(
  userId: string,
  date: string
): Promise<DuolingoCompletion | null> {
  const res = await earthboundFetch(`/api/duolingo/date/${date}?userId=${userId}`);
  if (!res.ok) return null;
  return await res.json();
}

/**
 * Get Duolingo completions for a date range
 */
export async function getDuolingoCompletionsForRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DuolingoCompletion[]> {
  const res = await earthboundFetch(`/api/duolingo/range?userId=${userId}&start=${startDate}&end=${endDate}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Toggle Duolingo lesson completion for a specific date
 * Returns true if now completed, false if completion was removed
 */
export async function toggleDuolingoCompletion(
  userId: string,
  date: string
): Promise<boolean> {
  const res = await earthboundFetch(`/api/duolingo/toggle?userId=${userId}&date=${date}`, {
    method: 'POST',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.completed;
}
