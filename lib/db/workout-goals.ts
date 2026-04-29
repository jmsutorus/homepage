import { getDatabase } from "./index";

export interface WorkoutGoal {
  id: number;
  userId: string;
  goal: string;
  met: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new workout goal
 */
export async function createWorkoutGoal(userId: string, goal: string): Promise<number> {
  const db = getDatabase();
  const result = await db.execute({
    sql: `INSERT INTO workout_goals (userId, goal) VALUES (?, ?)`,
    args: [userId, goal]
  });

  return Number(result.lastInsertRowid);
}

/**
 * Get all workout goals for a user
 */
export async function getWorkoutGoals(userId: string): Promise<WorkoutGoal[]> {
  const db = getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM workout_goals WHERE userId = ? ORDER BY created_at DESC",
    args: [userId]
  });
  
  return result.rows as unknown as WorkoutGoal[];
}

/**
 * Get a specific workout goal by id
 */
export async function getWorkoutGoal(id: number, userId: string): Promise<WorkoutGoal | undefined> {
  const db = getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM workout_goals WHERE id = ? AND userId = ?",
    args: [id, userId]
  });
  
  return result.rows[0] as unknown as WorkoutGoal | undefined;
}

/**
 * Update a workout goal
 */
export async function updateWorkoutGoal(id: number, userId: string, goal: string): Promise<boolean> {
  const db = getDatabase();

  const result = await db.execute({
    sql: `UPDATE workout_goals SET goal = ? WHERE id = ? AND userId = ?`,
    args: [goal, id, userId]
  });

  return (result.rowsAffected ?? 0) > 0;
}

/**
 * Mark a workout goal as met (or unmet)
 */
export async function markWorkoutGoalMet(id: number, userId: string, met: boolean): Promise<boolean> {
  const db = getDatabase();

  const result = await db.execute({
    sql: `UPDATE workout_goals SET met = ? WHERE id = ? AND userId = ?`,
    args: [met ? 1 : 0, id, userId]
  });

  return (result.rowsAffected ?? 0) > 0;
}

/**
 * Delete a workout goal
 */
export async function deleteWorkoutGoal(id: number, userId: string): Promise<boolean> {
  const db = getDatabase();

  const result = await db.execute({
    sql: "DELETE FROM workout_goals WHERE id = ? AND userId = ?",
    args: [id, userId]
  });
  
  return (result.rowsAffected ?? 0) > 0;
}
