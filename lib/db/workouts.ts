import { earthboundFetch } from "../api/earthbound";
import {
  type WorkoutPlan,
  type ScheduledWorkout,
} from "@jmsutorus/earthbound-shared";

export type WorkoutStats = {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  averageIntensity: number;
};

export type WorkoutByType = {
  type: string;
  count: number;
  totalDuration: number;
};

// Workout Plan CRUD Operations

/**
 * Create a new workout plan
 */
export async function createWorkoutPlan(plan: Omit<WorkoutPlan, "id" | "created_at" | "updated_at">): Promise<number> {
  const response = await earthboundFetch("/api/workouts/plans", {
    method: "POST",
    body: JSON.stringify(plan),
  });
  if (!response.ok) throw new Error("Failed to create workout plan");
  const result = await response.json() as { id: number };
  return result.id;
}

export async function getWorkoutPlan(id: number, userId: string): Promise<WorkoutPlan | undefined> {
  const response = await earthboundFetch(`/api/workouts/plans/id/${id}?userId=${userId}`);
  if (!response.ok) return undefined;
  return response.json() as Promise<WorkoutPlan>;
}

export async function getAllWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
  const response = await earthboundFetch(`/api/workouts/plans?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<WorkoutPlan[]>;
}

export async function getWorkoutPlansByType(userId: string, type: string): Promise<WorkoutPlan[]> {
  const response = await earthboundFetch(`/api/workouts/plans?userId=${userId}&type=${type}`);
  if (!response.ok) return [];
  return response.json() as Promise<WorkoutPlan[]>;
}

export async function updateWorkoutPlan(
  id: number,
  userId: string,
  updates: Partial<Omit<WorkoutPlan, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<boolean> {
  const response = await earthboundFetch(`/api/workouts/plans/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

export async function deleteWorkoutPlan(id: number, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/workouts/plans/id/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// Scheduled Workout CRUD Operations

export async function createScheduledWorkout(
  workout: Omit<ScheduledWorkout, "id" | "completed" | "completed_at" | "created_at" | "updated_at">
): Promise<number> {
  const response = await earthboundFetch("/api/workouts/scheduled", {
    method: "POST",
    body: JSON.stringify(workout),
  });
  if (!response.ok) throw new Error("Failed to create scheduled workout");
  const result = await response.json() as { id: number };
  return result.id;
}

export async function getScheduledWorkout(id: number, userId: string): Promise<ScheduledWorkout | undefined> {
  const response = await earthboundFetch(`/api/workouts/scheduled/id/${id}?userId=${userId}`);
  if (!response.ok) return undefined;
  return response.json() as Promise<ScheduledWorkout>;
}

export async function getScheduledWorkoutByCalendarEventId(eventId: string, userId: string): Promise<ScheduledWorkout | undefined> {
  const response = await earthboundFetch(`/api/workouts/scheduled/event/${eventId}?userId=${userId}`);
  if (!response.ok) return undefined;
  return response.json() as Promise<ScheduledWorkout>;
}

export async function getScheduledWorkouts(userId: string, startDate?: string, endDate?: string): Promise<ScheduledWorkout[]> {
  const query = new URLSearchParams({ userId });
  if (startDate) query.append("start", startDate);
  if (endDate) query.append("end", endDate);
  
  const response = await earthboundFetch(`/api/workouts/scheduled?${query.toString()}`);
  if (!response.ok) return [];
  return response.json() as Promise<ScheduledWorkout[]>;
}

export async function getUpcomingWorkouts(userId: string, limit: number = 10): Promise<ScheduledWorkout[]> {
  const response = await earthboundFetch(`/api/workouts/upcoming?userId=${userId}&limit=${limit}`);
  if (!response.ok) return [];
  return response.json() as Promise<ScheduledWorkout[]>;
}

export async function getCompletedWorkouts(userId: string, limit: number = 10): Promise<ScheduledWorkout[]> {
  const response = await earthboundFetch(`/api/workouts/completed?userId=${userId}&limit=${limit}`);
  if (!response.ok) return [];
  return response.json() as Promise<ScheduledWorkout[]>;
}

export async function updateScheduledWorkout(
  id: number,
  userId: string,
  updates: Partial<Omit<ScheduledWorkout, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<boolean> {
  const response = await earthboundFetch(`/api/workouts/scheduled/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

export async function markWorkoutCompleted(id: number, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/workouts/scheduled/id/${id}/complete`, {
    method: "POST",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

export async function deleteScheduledWorkout(id: number, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/workouts/scheduled/id/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// Analytics and Statistics


export async function getWorkoutStats(userId: string, startDate?: string, endDate?: string): Promise<WorkoutStats> {
  const query = new URLSearchParams({ userId });
  if (startDate) query.append("start", startDate);
  if (endDate) query.append("end", endDate);
  
  const response = await earthboundFetch(`/api/workouts/stats?${query.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch workout stats");
  return response.json() as Promise<WorkoutStats>;
}


export async function getWorkoutsByType(userId: string): Promise<WorkoutByType[]> {
  const response = await earthboundFetch(`/api/workouts/by-type?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<WorkoutByType[]>;
}
