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

export async function createWorkoutActivity(activity: CreateWorkoutActivity, userId: string): Promise<number> {
  const db = getDatabase();
  const result = await db.execute({
    sql: `INSERT INTO workout_activities (userId, date, time, length, difficulty, type, exercises, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      userId,
      activity.date,
      activity.time,
      activity.length,
      activity.difficulty,
      activity.type,
      JSON.stringify(activity.exercises),
      activity.notes || null
    ]
  });

  return Number(result.lastInsertRowid);
}

export async function getWorkoutActivity(id: number, userId: string): Promise<WorkoutActivity | undefined> {
  const db = getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM workout_activities WHERE id = ? AND userId = ?",
    args: [id, userId]
  });
  return result.rows[0] as unknown as WorkoutActivity | undefined;
}

export async function getAllWorkoutActivities(userId: string): Promise<WorkoutActivity[]> {
  const db = getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM workout_activities WHERE userId = ? ORDER BY date DESC, time DESC",
    args: [userId]
  });
  return result.rows as unknown as WorkoutActivity[];
}

export async function getWorkoutActivitiesByDateRange(startDate: string, endDate: string, userId: string): Promise<WorkoutActivity[]> {
  const db = getDatabase();
  const result = await db.execute({
    sql: `SELECT * FROM workout_activities
          WHERE userId = ? AND date >= ? AND date <= ?
          ORDER BY date ASC, time ASC`,
    args: [userId, startDate, endDate]
  });
  return result.rows as unknown as WorkoutActivity[];
}

export async function getWorkoutActivitiesByType(type: string, userId: string): Promise<WorkoutActivity[]> {
  const db = getDatabase();
  const result = await db.execute({
    sql: `SELECT * FROM workout_activities
          WHERE userId = ? AND type = ?
          ORDER BY date DESC, time DESC`,
    args: [userId, type]
  });
  return result.rows as unknown as WorkoutActivity[];
}

export async function getUpcomingWorkoutActivities(userId: string, limit: number = 10): Promise<WorkoutActivity[]> {
  const db = getDatabase();
  const today = new Date().toISOString().split("T")[0];

  const result = await db.execute({
    sql: `SELECT * FROM workout_activities
          WHERE userId = ? AND date >= ? AND completed = 0
          ORDER BY date ASC, time ASC
          LIMIT ?`,
    args: [userId, today, limit]
  });
  return result.rows as unknown as WorkoutActivity[];
}

export async function getRecentWorkoutActivities(userId: string, limit: number = 10): Promise<WorkoutActivity[]> {
  const db = getDatabase();
  const today = new Date().toISOString().split("T")[0];

  const result = await db.execute({
    sql: `SELECT * FROM workout_activities
          WHERE userId = ? AND date < ? AND completed = 0
          ORDER BY date DESC, time DESC
          LIMIT ?`,
    args: [userId, today, limit]
  });
  return result.rows as unknown as WorkoutActivity[];
}

export async function getCompletedWorkoutActivities(userId: string, limit: number = 10): Promise<WorkoutActivity[]> {
  const db = getDatabase();

  const result = await db.execute({
    sql: `SELECT * FROM workout_activities
          WHERE userId = ? AND completed = 1
          ORDER BY completed_at DESC
          LIMIT ?`,
    args: [userId, limit]
  });
  return result.rows as unknown as WorkoutActivity[];
}

export async function updateWorkoutActivity(
  id: number,
  userId: string,
  updates: Partial<Omit<WorkoutActivity, "id" | "userId" | "created_at" | "updated_at">>
): Promise<boolean> {
  const db = getDatabase();

  // Verify ownership
  const existing = await getWorkoutActivity(id, userId);
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
    await db.execute({
      sql: `UPDATE workout_activities SET ${fields} WHERE id = ? AND userId = ?`,
      args: [...Object.values(updates), id, userId]
    });
  }

  return true;
}

export async function markWorkoutActivityCompleted(
  id: number,
  userId: string,
  stravaActivityId?: number | null,
  completionNotes?: string | null
): Promise<boolean> {
  const db = getDatabase();

  // Verify ownership
  const existing = await getWorkoutActivity(id, userId);
  if (!existing) {
    return false;
  }

  const now = new Date().toISOString();

  await db.execute({
    sql: `UPDATE workout_activities
          SET completed = 1, completed_at = ?, strava_activity_id = ?, completion_notes = ?
          WHERE id = ? AND userId = ?`,
    args: [now, stravaActivityId || null, completionNotes || null, id, userId]
  });

  return true;
}

export async function deleteWorkoutActivity(id: number, userId: string): Promise<boolean> {
  const db = getDatabase();

  // Verify ownership
  const existing = await getWorkoutActivity(id, userId);
  if (!existing) {
    return false;
  }

  const result = await db.execute({
    sql: "DELETE FROM workout_activities WHERE id = ? AND userId = ?",
    args: [id, userId]
  });
  return (result.rowsAffected ?? 0) > 0;
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

export async function getWorkoutActivityStats(userId: string, startDate?: string, endDate?: string): Promise<WorkoutActivityStats> {
  const db = getDatabase();

  let whereClause = " WHERE userId = ?";
  const params: (string | number)[] = [userId];

  if (startDate && endDate) {
    whereClause += " AND date >= ? AND date <= ?";
    params.push(startDate, endDate);
  }

  // Overall stats
  const overallResult = await db.execute({
    sql: `SELECT
            COUNT(*) as total_activities,
            SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_activities,
            SUM(length) as total_duration,
            AVG(length) as avg_duration
          FROM workout_activities${whereClause}`,
    args: params
  });
  const overall = overallResult.rows[0] as unknown as {
    total_activities: number;
    completed_activities: number;
    total_duration: number;
    avg_duration: number;
  };

  // By type
  const byTypeResult = await db.execute({
    sql: `SELECT
            type,
            COUNT(*) as count,
            SUM(length) as total_duration
          FROM workout_activities${whereClause}
          GROUP BY type
          ORDER BY count DESC`,
    args: params
  });
  const byType = byTypeResult.rows as unknown as { type: string; count: number; total_duration: number }[];

  // By difficulty
  const byDifficultyResult = await db.execute({
    sql: `SELECT
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
            END`,
    args: params
  });
  const byDifficulty = byDifficultyResult.rows as unknown as { difficulty: string; count: number }[];

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
export async function parseExercises(exercisesJson: string): Promise<Exercise[]> {
  try {
    return JSON.parse(exercisesJson);
  } catch {
    return [];
  }
}
