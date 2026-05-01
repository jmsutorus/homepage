import { earthboundFetch } from "../api/earthbound";

import {
  type WorkoutGoal,
} from "@jmsutorus/earthbound-shared";

export type {
  WorkoutGoal,
};

/**
 * Create a new workout goal
 */
export async function createWorkoutGoal(userId: string, goal: string): Promise<number> {
  const response = await earthboundFetch("/api/workout-goals", {
    method: "POST",
    body: JSON.stringify({ goal }),
  });
  if (!response.ok) throw new Error("Failed to create workout goal");
  const result = await response.json() as { id: number };
  return result.id;
}

/**
 * Get all workout goals for a user
 */
export async function getWorkoutGoals(userId: string): Promise<WorkoutGoal[]> {
  const response = await earthboundFetch(`/api/workout-goals?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<WorkoutGoal[]>;
}

/**
 * Get a specific workout goal by id
 */
export async function getWorkoutGoal(id: number, userId: string): Promise<WorkoutGoal | undefined> {
  const response = await earthboundFetch(`/api/workout-goals/id/${id}?userId=${userId}`);
  if (!response.ok) return undefined;
  return response.json() as Promise<WorkoutGoal>;
}

/**
 * Update a workout goal
 */
export async function updateWorkoutGoal(id: number, userId: string, goal: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/workout-goals/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ goal }),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Mark a workout goal as met (or unmet)
 */
export async function markWorkoutGoalMet(id: number, userId: string, met: boolean): Promise<boolean> {
  const response = await earthboundFetch(`/api/workout-goals/id/${id}/met`, {
    method: "POST",
    body: JSON.stringify({ met }),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Delete a workout goal
 */
export async function deleteWorkoutGoal(id: number, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/workout-goals/id/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}
