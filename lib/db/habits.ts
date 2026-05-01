import { earthboundFetch } from "../api/earthbound";

import {
  type Habit,
  type HabitCompletion,
  type HabitStats,
  type HabitCompletionChartData,
} from "@jmsutorus/earthbound-shared";

export type {
  Habit,
  HabitCompletion,
  HabitStats,
  HabitCompletionChartData,
};

/**
 * Get all active habits for a user
 */
export async function getHabits(userId: string): Promise<Habit[]> {
  const response = await earthboundFetch(`/api/habits?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<Habit[]>;
}

/**
 * Get all habits for a user (including archived)
 */
export async function getAllHabits(userId: string): Promise<Habit[]> {
  const response = await earthboundFetch(`/api/habits/all?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<Habit[]>;
}

/**
 * Create a new habit
 */
export async function createHabit(userId: string, data: {
  title: string;
  description?: string;
  frequency?: string;
  target?: number;
  isInfinite?: boolean;
  createdAt?: string; // Optional client-provided timestamp in local time
}): Promise<Habit> {
  const response = await earthboundFetch(`/api/habits`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`Failed to create habit: ${response.statusText}`);
  return response.json() as Promise<Habit>;
}

/**
 * Update a habit
 */
export async function updateHabit(id: number, userId: string, data: {
  title?: string;
  description?: string;
  frequency?: string;
  target?: number;
  is_infinite?: boolean;
  active?: boolean;
  completed?: boolean;
  order_index?: number;
}): Promise<Habit> {
  const response = await earthboundFetch(`/api/habits/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`Failed to update habit: ${response.statusText}`);
  return response.json() as Promise<Habit>;
}

/**
 * Delete a habit
 */
export async function deleteHabit(id: number, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/habits/id/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Get habit completions for a specific date
 */
export async function getHabitCompletions(userId: string, date: string): Promise<HabitCompletion[]> {
  const response = await earthboundFetch(`/api/habits/completions?userId=${userId}&date=${date}`);
  if (!response.ok) return [];
  return response.json() as Promise<HabitCompletion[]>;
}

/**
 * Get habit completions for a date range
 */
export async function getHabitCompletionsForRange(userId: string, startDate: string, endDate: string): Promise<HabitCompletion[]> {
  const response = await earthboundFetch(`/api/habits/completions?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
  if (!response.ok) return [];
  return response.json() as Promise<HabitCompletion[]>;
}

/**
 * Toggle habit completion
 */
export async function toggleHabitCompletion(habitId: number, userId: string, date: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/habits/completions/toggle`, {
    method: "POST",
    body: JSON.stringify({ habitId, date }),
  });

  if (!response.ok) throw new Error(`Failed to toggle habit completion: ${response.statusText}`);
  const result = await response.json() as { completed: boolean };
  return result.completed;
}



/**
 * Calculate habit statistics
 */
export async function getHabitStats(habit: Habit, userId: string): Promise<HabitStats> {
  const response = await earthboundFetch(`/api/habits/id/${habit.id}/stats?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to get habit stats: ${response.statusText}`);
  return response.json() as Promise<HabitStats>;
}



/**
 * Get habit completion data for charts (last 12 weeks)
 */
export async function getHabitCompletionsForChart(userId: string): Promise<HabitCompletionChartData[]> {
  const response = await earthboundFetch(`/api/habits/charts?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<HabitCompletionChartData[]>;
}
