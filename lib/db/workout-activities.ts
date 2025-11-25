import { getDatabase } from "./index";

// Types
export interface Exercise {
  description: string; // e.g., "Run 10 minutes at 6 minute mile pace" or "Barbell curls"
  reps?: number; // Number of reps (for strength exercises)
  sets?: number; // Number of sets (for strength exercises)
  duration?: number; // Duration in minutes (for cardio)
  pace?: string; // Pace description (for cardio)
  weight?: number; // Weight in lbs (for strength exercises)
}

export interface WorkoutActivity {
  id: number;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  length: number; // Total duration in minutes
  difficulty: "easy" | "moderate" | "hard" | "very hard";
  type: "cardio" | "strength" | "flexibility" | "sports" | "mixed" | "other";
  exercises: string; // JSON string of Exercise[]
  notes?: string | null;
  completed: boolean;
  completed_at?: string | null;
  completion_notes?: string | null; // Post-activity notes
  strava_activity_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkoutActivity {
  date: string;
  time: string;
  length: number;
  difficulty: "easy" | "moderate" | "hard" | "very hard";
  type: "cardio" | "strength" | "flexibility" | "sports" | "mixed" | "other";
  exercises: Exercise[];
  notes?: string;
}

// CRUD Operations

export function createWorkoutActivity(activity: CreateWorkoutActivity, userId: string): number {
  const db = getDatabase();
  const result = db
    .prepare(
      `INSERT INTO workout_activities (userId, date, time, length, difficulty, type, exercises, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      activity.date,
      activity.time,
      activity.length,
      activity.difficulty,
      activity.type,
      JSON.stringify(activity.exercises),
      activity.notes || null
    );

  return result.lastInsertRowid as number;
}

export function getWorkoutActivity(id: number, userId: string): WorkoutActivity | undefined {
  const db = getDatabase();
  return db.prepare("SELECT * FROM workout_activities WHERE id = ? AND userId = ?").get(id, userId) as
    | WorkoutActivity
    | undefined;
}

export function getAllWorkoutActivities(userId: string): WorkoutActivity[] {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM workout_activities WHERE userId = ? ORDER BY date DESC, time DESC")
    .all(userId) as WorkoutActivity[];
}

export function getWorkoutActivitiesByDateRange(startDate: string, endDate: string, userId: string): WorkoutActivity[] {
  const db = getDatabase();
  return db
    .prepare(
      `SELECT * FROM workout_activities
       WHERE userId = ? AND date >= ? AND date <= ?
       ORDER BY date ASC, time ASC`
    )
    .all(userId, startDate, endDate) as WorkoutActivity[];
}

export function getWorkoutActivitiesByType(type: string, userId: string): WorkoutActivity[] {
  const db = getDatabase();
  return db
    .prepare(
      `SELECT * FROM workout_activities
       WHERE userId = ? AND type = ?
       ORDER BY date DESC, time DESC`
    )
    .all(userId, type) as WorkoutActivity[];
}

export function getUpcomingWorkoutActivities(userId: string, limit: number = 10): WorkoutActivity[] {
  const db = getDatabase();
  const today = new Date().toISOString().split("T")[0];

  return db
    .prepare(
      `SELECT * FROM workout_activities
       WHERE userId = ? AND date >= ? AND completed = 0
       ORDER BY date ASC, time ASC
       LIMIT ?`
    )
    .all(userId, today, limit) as WorkoutActivity[];
}

export function getCompletedWorkoutActivities(userId: string, limit: number = 10): WorkoutActivity[] {
  const db = getDatabase();

  return db
    .prepare(
      `SELECT * FROM workout_activities
       WHERE userId = ? AND completed = 1
       ORDER BY completed_at DESC
       LIMIT ?`
    )
    .all(userId, limit) as WorkoutActivity[];
}

export function updateWorkoutActivity(
  id: number,
  userId: string,
  updates: Partial<Omit<WorkoutActivity, "id" | "userId" | "created_at" | "updated_at">>
): boolean {
  const db = getDatabase();

  // Verify ownership
  const existing = getWorkoutActivity(id, userId);
  if (!existing) {
    return false;
  }

  // If exercises is an array, convert to JSON string
  if (updates.exercises && typeof updates.exercises !== 'string') {
    updates.exercises = JSON.stringify(updates.exercises);
  }

  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");

  if (fields) {
    db.prepare(`UPDATE workout_activities SET ${fields} WHERE id = ? AND userId = ?`).run(
      ...Object.values(updates),
      id,
      userId
    );
  }

  return true;
}

export function markWorkoutActivityCompleted(
  id: number,
  userId: string,
  stravaActivityId?: number | null,
  completionNotes?: string | null
): boolean {
  const db = getDatabase();

  // Verify ownership
  const existing = getWorkoutActivity(id, userId);
  if (!existing) {
    return false;
  }

  const now = new Date().toISOString();

  db.prepare(
    `UPDATE workout_activities
     SET completed = 1, completed_at = ?, strava_activity_id = ?, completion_notes = ?
     WHERE id = ? AND userId = ?`
  ).run(now, stravaActivityId || null, completionNotes || null, id, userId);

  return true;
}

export function deleteWorkoutActivity(id: number, userId: string): boolean {
  const db = getDatabase();

  // Verify ownership
  const existing = getWorkoutActivity(id, userId);
  if (!existing) {
    return false;
  }

  const result = db.prepare("DELETE FROM workout_activities WHERE id = ? AND userId = ?").run(id, userId);
  return result.changes > 0;
}

// Analytics and Statistics

export interface WorkoutActivityStats {
  total_activities: number;
  completed_activities: number;
  completion_rate: number;
  total_duration: number;
  avg_duration: number;
  by_type: {
    type: string;
    count: number;
    total_duration: number;
  }[];
  by_difficulty: {
    difficulty: string;
    count: number;
  }[];
}

export function getWorkoutActivityStats(userId: string, startDate?: string, endDate?: string): WorkoutActivityStats {
  const db = getDatabase();

  let whereClause = " WHERE userId = ?";
  const params: any[] = [userId];

  if (startDate && endDate) {
    whereClause += " AND date >= ? AND date <= ?";
    params.push(startDate, endDate);
  }

  // Overall stats
  const overall = db
    .prepare(
      `SELECT
        COUNT(*) as total_activities,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_activities,
        SUM(length) as total_duration,
        AVG(length) as avg_duration
      FROM workout_activities${whereClause}`
    )
    .get(...params) as any;

  // By type
  const byType = db
    .prepare(
      `SELECT
        type,
        COUNT(*) as count,
        SUM(length) as total_duration
      FROM workout_activities${whereClause}
      GROUP BY type
      ORDER BY count DESC`
    )
    .all(...params) as any[];

  // By difficulty
  const byDifficulty = db
    .prepare(
      `SELECT
        difficulty,
        COUNT(*) as count
      FROM workout_activities${whereClause}
      GROUP BY difficulty
      ORDER BY
        CASE difficulty
          WHEN 'easy' THEN 1
          WHEN 'moderate' THEN 2
          WHEN 'hard' THEN 3
          WHEN 'very hard' THEN 4
        END`
    )
    .all(...params) as any[];

  return {
    total_activities: overall.total_activities || 0,
    completed_activities: overall.completed_activities || 0,
    completion_rate:
      overall.total_activities > 0
        ? (overall.completed_activities / overall.total_activities) * 100
        : 0,
    total_duration: overall.total_duration || 0,
    avg_duration: overall.avg_duration || 0,
    by_type: byType,
    by_difficulty: byDifficulty,
  };
}

// Helper function to parse exercises from JSON string
export function parseExercises(exercisesJson: string): Exercise[] {
  try {
    return JSON.parse(exercisesJson);
  } catch {
    return [];
  }
}
