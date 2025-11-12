import { getDatabase } from "./index";

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

export function createWorkoutPlan(plan: Omit<WorkoutPlan, "id" | "created_at" | "updated_at">): number {
  const db = getDatabase();
  const result = db
    .prepare(
      `INSERT INTO workout_plans (user_id, name, description, exercises, duration, intensity, type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      plan.user_id,
      plan.name,
      plan.description || null,
      plan.exercises || null,
      plan.duration,
      plan.intensity,
      plan.type
    );

  return result.lastInsertRowid as number;
}

export function getWorkoutPlan(id: number): WorkoutPlan | undefined {
  const db = getDatabase();
  return db.prepare("SELECT * FROM workout_plans WHERE id = ?").get(id) as WorkoutPlan | undefined;
}

export function getAllWorkoutPlans(userId: string): WorkoutPlan[] {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as WorkoutPlan[];
}

export function getWorkoutPlansByType(userId: string, type: string): WorkoutPlan[] {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM workout_plans WHERE user_id = ? AND type = ? ORDER BY created_at DESC")
    .all(userId, type) as WorkoutPlan[];
}

export function updateWorkoutPlan(
  id: number,
  updates: Partial<Omit<WorkoutPlan, "id" | "user_id" | "created_at" | "updated_at">>
): void {
  const db = getDatabase();
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");

  if (fields) {
    db.prepare(`UPDATE workout_plans SET ${fields} WHERE id = ?`).run(
      ...Object.values(updates),
      id
    );
  }
}

export function deleteWorkoutPlan(id: number): void {
  const db = getDatabase();
  db.prepare("DELETE FROM workout_plans WHERE id = ?").run(id);
}

// Scheduled Workout CRUD Operations

export function createScheduledWorkout(
  workout: Omit<ScheduledWorkout, "id" | "completed" | "completed_at" | "created_at" | "updated_at">
): number {
  const db = getDatabase();
  const result = db
    .prepare(
      `INSERT INTO scheduled_workouts
       (user_id, workout_plan_id, calendar_event_id, scheduled_date, scheduled_time,
        duration, reminder_minutes, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      workout.user_id,
      workout.workout_plan_id || null,
      workout.calendar_event_id || null,
      workout.scheduled_date,
      workout.scheduled_time,
      workout.duration,
      workout.reminder_minutes,
      workout.notes || null
    );

  return result.lastInsertRowid as number;
}

export function getScheduledWorkout(id: number): ScheduledWorkout | undefined {
  const db = getDatabase();
  return db.prepare("SELECT * FROM scheduled_workouts WHERE id = ?").get(id) as
    | ScheduledWorkout
    | undefined;
}

export function getScheduledWorkoutByCalendarEventId(eventId: string): ScheduledWorkout | undefined {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM scheduled_workouts WHERE calendar_event_id = ?")
    .get(eventId) as ScheduledWorkout | undefined;
}

export function getScheduledWorkouts(userId: string, startDate?: string, endDate?: string): ScheduledWorkout[] {
  const db = getDatabase();

  if (startDate && endDate) {
    return db
      .prepare(
        `SELECT * FROM scheduled_workouts
         WHERE user_id = ? AND scheduled_date >= ? AND scheduled_date <= ?
         ORDER BY scheduled_date ASC, scheduled_time ASC`
      )
      .all(userId, startDate, endDate) as ScheduledWorkout[];
  }

  return db
    .prepare(
      `SELECT * FROM scheduled_workouts
       WHERE user_id = ?
       ORDER BY scheduled_date DESC, scheduled_time DESC`
    )
    .all(userId) as ScheduledWorkout[];
}

export function getUpcomingWorkouts(userId: string, limit: number = 10): ScheduledWorkout[] {
  const db = getDatabase();
  const today = new Date().toISOString().split("T")[0];

  return db
    .prepare(
      `SELECT * FROM scheduled_workouts
       WHERE user_id = ? AND scheduled_date >= ? AND completed = 0
       ORDER BY scheduled_date ASC, scheduled_time ASC
       LIMIT ?`
    )
    .all(userId, today, limit) as ScheduledWorkout[];
}

export function getCompletedWorkouts(userId: string, limit: number = 10): ScheduledWorkout[] {
  const db = getDatabase();

  return db
    .prepare(
      `SELECT * FROM scheduled_workouts
       WHERE user_id = ? AND completed = 1
       ORDER BY completed_at DESC
       LIMIT ?`
    )
    .all(userId, limit) as ScheduledWorkout[];
}

export function updateScheduledWorkout(
  id: number,
  updates: Partial<Omit<ScheduledWorkout, "id" | "user_id" | "created_at" | "updated_at">>
): void {
  const db = getDatabase();
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");

  if (fields) {
    db.prepare(`UPDATE scheduled_workouts SET ${fields} WHERE id = ?`).run(
      ...Object.values(updates),
      id
    );
  }
}

export function markWorkoutCompleted(id: number, stravaActivityId?: number): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE scheduled_workouts
     SET completed = 1, completed_at = ?, strava_activity_id = ?
     WHERE id = ?`
  ).run(now, stravaActivityId || null, id);
}

export function deleteScheduledWorkout(id: number): void {
  const db = getDatabase();
  db.prepare("DELETE FROM scheduled_workouts WHERE id = ?").run(id);
}

// Analytics and Statistics

export interface WorkoutStats {
  total_workouts: number;
  completed_workouts: number;
  completion_rate: number;
  total_duration: number;
  avg_duration: number;
}

export function getWorkoutStats(userId: string, startDate?: string, endDate?: string): WorkoutStats {
  const db = getDatabase();

  let query = `
    SELECT
      COUNT(*) as total_workouts,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_workouts,
      SUM(duration) as total_duration,
      AVG(duration) as avg_duration
    FROM scheduled_workouts
    WHERE user_id = ?
  `;

  const params: any[] = [userId];

  if (startDate && endDate) {
    query += ` AND scheduled_date >= ? AND scheduled_date <= ?`;
    params.push(startDate, endDate);
  }

  const result = db.prepare(query).get(...params) as any;

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

export function getWorkoutsByType(userId: string): WorkoutByType[] {
  const db = getDatabase();

  return db
    .prepare(
      `SELECT
         wp.type,
         COUNT(*) as count,
         SUM(sw.duration) as total_duration
       FROM scheduled_workouts sw
       LEFT JOIN workout_plans wp ON sw.workout_plan_id = wp.id
       WHERE sw.user_id = ? AND sw.completed = 1
       GROUP BY wp.type
       ORDER BY count DESC`
    )
    .all(userId) as WorkoutByType[];
}
