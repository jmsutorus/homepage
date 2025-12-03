import { getDatabase, queryOne } from "./index";

// Types
export interface WorkoutPlan {
  id: number;
  user_id: string;
  name: string;
  description?: string | null;
  exercises?: string | null; // JSON string
  duration: number;
  intensity: "low" | "medium" | "high";
  type: "cardio" | "strength" | "flexibility" | "sports" | "other";
  created_at: string;
  updated_at: string;
}

export interface ScheduledWorkout {
  id: number;
  user_id: string;
  workout_plan_id?: number | null;
  calendar_event_id?: string | null;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM
  duration: number;
  reminder_minutes: number;
  completed: boolean;
  completed_at?: string | null;
  strava_activity_id?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Workout Plan CRUD Operations

export async function createWorkoutPlan(plan: Omit<WorkoutPlan, "id" | "created_at" | "updated_at">): Promise<number> {
  const db = getDatabase();
  const result = await db.execute({
    sql: `INSERT INTO workout_plans (user_id, name, description, exercises, duration, intensity, type)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      plan.user_id,
      plan.name,
      plan.description || null,
      plan.exercises || null,
      plan.duration,
      plan.intensity,
      plan.type
    ]
  });

  return Number(result.lastInsertRowid);
}

export async function getWorkoutPlan(id: number, userId: string): Promise<WorkoutPlan | undefined> {
  const db = getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM workout_plans WHERE id = ? AND user_id = ?",
    args: [id, userId]
  });
  return result.rows[0] as unknown as WorkoutPlan | undefined;
}

export async function getAllWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
  const db = getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId]
  });
  return result.rows as unknown as WorkoutPlan[];
}

export async function getWorkoutPlansByType(userId: string, type: string): Promise<WorkoutPlan[]> {
  const db = getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM workout_plans WHERE user_id = ? AND type = ? ORDER BY created_at DESC",
    args: [userId, type]
  });
  return result.rows as unknown as WorkoutPlan[];
}

export async function updateWorkoutPlan(
  id: number,
  userId: string,
  updates: Partial<Omit<WorkoutPlan, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<boolean> {
  const db = getDatabase();

  // Verify ownership
  const existing = await getWorkoutPlan(id, userId);
  if (!existing) {
    return false;
  }

  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");

  if (fields) {
    await db.execute({
      sql: `UPDATE workout_plans SET ${fields} WHERE id = ? AND user_id = ?`,
      args: [...Object.values(updates), id, userId]
    });
  }

  return true;
}

export async function deleteWorkoutPlan(id: number, userId: string): Promise<boolean> {
  const db = getDatabase();

  // Verify ownership
  const existing = await getWorkoutPlan(id, userId);
  if (!existing) {
    return false;
  }

  const result = await db.execute({
    sql: "DELETE FROM workout_plans WHERE id = ? AND user_id = ?",
    args: [id, userId]
  });
  return (result.rowsAffected ?? 0) > 0;
}

// Scheduled Workout CRUD Operations

export async function createScheduledWorkout(
  workout: Omit<ScheduledWorkout, "id" | "completed" | "completed_at" | "created_at" | "updated_at">
): Promise<number> {
  const db = getDatabase();
  const result = await db.execute({
    sql: `INSERT INTO scheduled_workouts
          (user_id, workout_plan_id, calendar_event_id, scheduled_date, scheduled_time,
           duration, reminder_minutes, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      workout.user_id,
      workout.workout_plan_id || null,
      workout.calendar_event_id || null,
      workout.scheduled_date,
      workout.scheduled_time,
      workout.duration,
      workout.reminder_minutes,
      workout.notes || null
    ]
  });

  return Number(result.lastInsertRowid);
}

export async function getScheduledWorkout(id: number, userId: string): Promise<ScheduledWorkout | undefined> {
  const db = getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM scheduled_workouts WHERE id = ? AND user_id = ?",
    args: [id, userId]
  });
  return result.rows[0] as unknown as ScheduledWorkout | undefined;
}

export async function getScheduledWorkoutByCalendarEventId(eventId: string, userId: string): Promise<ScheduledWorkout | undefined> {
  const db = getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM scheduled_workouts WHERE calendar_event_id = ? AND user_id = ?",
    args: [eventId, userId]
  });
  return result.rows[0] as unknown as ScheduledWorkout | undefined;
}

export async function getScheduledWorkouts(userId: string, startDate?: string, endDate?: string): Promise<ScheduledWorkout[]> {
  const db = getDatabase();

  if (startDate && endDate) {
    const result = await db.execute({
      sql: `SELECT * FROM scheduled_workouts
            WHERE user_id = ? AND scheduled_date >= ? AND scheduled_date <= ?
            ORDER BY scheduled_date ASC, scheduled_time ASC`,
      args: [userId, startDate, endDate]
    });
    return result.rows as unknown as ScheduledWorkout[];
  }

  const result = await db.execute({
    sql: `SELECT * FROM scheduled_workouts
          WHERE user_id = ?
          ORDER BY scheduled_date DESC, scheduled_time DESC`,
    args: [userId]
  });
  return result.rows as unknown as ScheduledWorkout[];
}

export async function getUpcomingWorkouts(userId: string, limit: number = 10): Promise<ScheduledWorkout[]> {
  const db = getDatabase();
  const today = new Date().toISOString().split("T")[0];

  const result = await db.execute({
    sql: `SELECT * FROM scheduled_workouts
          WHERE user_id = ? AND scheduled_date >= ? AND completed = 0
          ORDER BY scheduled_date ASC, scheduled_time ASC
          LIMIT ?`,
    args: [userId, today, limit]
  });
  return result.rows as unknown as ScheduledWorkout[];
}

export async function getCompletedWorkouts(userId: string, limit: number = 10): Promise<ScheduledWorkout[]> {
  const db = getDatabase();

  const result = await db.execute({
    sql: `SELECT * FROM scheduled_workouts
          WHERE user_id = ? AND completed = 1
          ORDER BY completed_at DESC
          LIMIT ?`,
    args: [userId, limit]
  });
  return result.rows as unknown as ScheduledWorkout[];
}

export async function updateScheduledWorkout(
  id: number,
  userId: string,
  updates: Partial<Omit<ScheduledWorkout, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<boolean> {
  const db = getDatabase();

  // Verify ownership
  const existing = await getScheduledWorkout(id, userId);
  if (!existing) {
    return false;
  }

  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");

  if (fields) {
    await db.execute({
      sql: `UPDATE scheduled_workouts SET ${fields} WHERE id = ? AND user_id = ?`,
      args: [...Object.values(updates), id, userId]
    });
  }

  return true;
}

export async function markWorkoutCompleted(id: number, userId: string, stravaActivityId?: number): Promise<boolean> {
  const db = getDatabase();

  // Verify ownership
  const existing = await getScheduledWorkout(id, userId);
  if (!existing) {
    return false;
  }

  const now = new Date().toISOString();

  await db.execute({
    sql: `UPDATE scheduled_workouts
          SET completed = 1, completed_at = ?, strava_activity_id = ?
          WHERE id = ? AND user_id = ?`,
    args: [now, stravaActivityId || null, id, userId]
  });

  return true;
}

export async function deleteScheduledWorkout(id: number, userId: string): Promise<boolean> {
  const db = getDatabase();

  // Verify ownership
  const existing = await getScheduledWorkout(id, userId);
  if (!existing) {
    return false;
  }

  const result = await db.execute({
    sql: "DELETE FROM scheduled_workouts WHERE id = ? AND user_id = ?",
    args: [id, userId]
  });
  return (result.rowsAffected ?? 0) > 0;
}

// Analytics and Statistics

export interface WorkoutStats {
  total_workouts: number;
  completed_workouts: number;
  completion_rate: number;
  total_duration: number;
  avg_duration: number;
}

export async function getWorkoutStats(userId: string, startDate?: string, endDate?: string): Promise<WorkoutStats> {


  let queryString = `
    SELECT
      COUNT(*) as total_workouts,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_workouts,
      SUM(duration) as total_duration,
      AVG(duration) as avg_duration
    FROM scheduled_workouts
    WHERE user_id = ?
  `;

  const params: (string | number)[] = [userId];

  if (startDate && endDate) {
    queryString += ` AND scheduled_date >= ? AND scheduled_date <= ?`;
    params.push(startDate, endDate);
  }

  const result = await queryOne(queryString, params) as {
    total_workouts: number;
    completed_workouts: number;
    total_duration: number;
    avg_duration: number;
  };

  return {
    total_workouts: result.total_workouts || 0,
    completed_workouts: result.completed_workouts || 0,
    completion_rate:
      result.total_workouts > 0 ? (result.completed_workouts / result.total_workouts) * 100 : 0,
    total_duration: result.total_duration || 0,
    avg_duration: result.avg_duration || 0,
  };
}

export interface WorkoutByType {
  type: string;
  count: number;
  total_duration: number;
}

export async function getWorkoutsByType(userId: string): Promise<WorkoutByType[]> {
  const db = getDatabase();

  const result = await db.execute({
    sql: `SELECT
            wp.type,
            COUNT(*) as count,
            SUM(sw.duration) as total_duration
          FROM scheduled_workouts sw
          LEFT JOIN workout_plans wp ON sw.workout_plan_id = wp.id
          WHERE sw.user_id = ? AND sw.completed = 1
          GROUP BY wp.type
          ORDER BY count DESC`,
    args: [userId]
  });
  return result.rows as unknown as WorkoutByType[];
}
