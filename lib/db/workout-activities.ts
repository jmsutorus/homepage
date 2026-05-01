import { earthboundFetch } from "../api/earthbound";

// Types
import {
  type Exercise,
  type WorkoutActivity,
  type CreateWorkoutActivity,
  type WorkoutActivityStats,
} from "@jmsutorus/earthbound-shared";

export type {
  Exercise,
  WorkoutActivity,
  CreateWorkoutActivity,
  WorkoutActivityStats,
};

// CRUD Operations

/**
 * Create a new workout activity
 */
export async function createWorkoutActivity(activity: CreateWorkoutActivity, userId: string): Promise<number> {
  const response = await earthboundFetch("/api/workout-activities", {
    method: "POST",
    body: JSON.stringify(activity),
  });
  if (!response.ok) throw new Error("Failed to create workout activity");
  const result = await response.json() as { id: number };
  return result.id;
}

export async function getWorkoutActivity(id: number, userId: string): Promise<WorkoutActivity | undefined> {
  const response = await earthboundFetch(`/api/workout-activities/id/${id}?userId=${userId}`);
  if (!response.ok) return undefined;
  return response.json() as Promise<WorkoutActivity>;
}

export async function getAllWorkoutActivities(userId: string): Promise<WorkoutActivity[]> {
  const response = await earthboundFetch(`/api/workout-activities?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<WorkoutActivity[]>;
}

export async function getWorkoutActivitiesByDateRange(startDate: string, endDate: string, userId: string): Promise<WorkoutActivity[]> {
  const response = await earthboundFetch(`/api/workout-activities/range?userId=${userId}&start=${startDate}&end=${endDate}`);
  if (!response.ok) return [];
  return response.json() as Promise<WorkoutActivity[]>;
}

export async function getWorkoutActivitiesByType(type: string, userId: string): Promise<WorkoutActivity[]> {
  const response = await earthboundFetch(`/api/workout-activities/type/${type}?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<WorkoutActivity[]>;
}

export async function getUpcomingWorkoutActivities(userId: string, limit: number = 10): Promise<WorkoutActivity[]> {
  const response = await earthboundFetch(`/api/workout-activities/upcoming?userId=${userId}&limit=${limit}`);
  if (!response.ok) return [];
  return response.json() as Promise<WorkoutActivity[]>;
}

export async function getRecentWorkoutActivities(userId: string, limit: number = 10): Promise<WorkoutActivity[]> {
  const response = await earthboundFetch(`/api/workout-activities/recent?userId=${userId}&limit=${limit}`);
  if (!response.ok) return [];
  return response.json() as Promise<WorkoutActivity[]>;
}

export async function getCompletedWorkoutActivities(userId: string, limit: number = 10): Promise<WorkoutActivity[]> {
  const response = await earthboundFetch(`/api/workout-activities/completed?userId=${userId}&limit=${limit}`);
  if (!response.ok) return [];
  return response.json() as Promise<WorkoutActivity[]>;
}

export async function updateWorkoutActivity(
  id: number,
  userId: string,
  updates: Partial<Omit<WorkoutActivity, "id" | "userId" | "created_at" | "updated_at">>
): Promise<boolean> {
  const response = await earthboundFetch(`/api/workout-activities/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

export async function markWorkoutActivityCompleted(
  id: number,
  userId: string,
  completionNotes?: string | null
): Promise<boolean> {
  const response = await earthboundFetch(`/api/workout-activities/id/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({ notes: completionNotes }),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

export async function deleteWorkoutActivity(id: number, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/workout-activities/id/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// Analytics and Statistics

export async function getWorkoutActivityStats(userId: string, startDate?: string, endDate?: string): Promise<WorkoutActivityStats> {
  const query = new URLSearchParams({ userId });
  if (startDate) query.append("start", startDate);
  if (endDate) query.append("end", endDate);
  
  const response = await earthboundFetch(`/api/workout-activities/stats?${query.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch activity stats");
  return response.json() as Promise<WorkoutActivityStats>;
}

// Helper function to parse exercises from JSON string
export async function parseExercises(exercisesJson: string): Promise<Exercise[]> {
  try {
    return JSON.parse(exercisesJson);
  } catch {
    return [];
  }
}
