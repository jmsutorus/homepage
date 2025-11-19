import { getDatabase, query, queryOne, execute } from "@/lib/db";

export interface Habit {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  frequency: string;
  target: number;
  active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: number;
  habit_id: number;
  userId: string;
  date: string;
  completed_at: string;
  value: number;
}

/**
 * Get all active habits for a user
 */
export function getHabits(userId: string): Habit[] {
  try {
    return query<Habit>(
      "SELECT * FROM habits WHERE userId = ? AND active = 1 ORDER BY order_index ASC, created_at DESC",
      [userId]
    );
  } catch (error) {
    console.error("Error getting habits:", error);
    return [];
  }
}

/**
 * Get all habits for a user (including archived)
 */
export function getAllHabits(userId: string): Habit[] {
  try {
    return query<Habit>(
      "SELECT * FROM habits WHERE userId = ? ORDER BY active DESC, order_index ASC, created_at DESC",
      [userId]
    );
  } catch (error) {
    console.error("Error getting all habits:", error);
    return [];
  }
}

/**
 * Create a new habit
 */
export function createHabit(userId: string, data: {
  title: string;
  description?: string;
  frequency?: string;
  target?: number;
}): Habit {
  try {
    const result = execute(
      `INSERT INTO habits (userId, title, description, frequency, target)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        data.title,
        data.description || null,
        data.frequency || 'daily',
        data.target || 1
      ]
    );

    const habit = queryOne<Habit>("SELECT * FROM habits WHERE id = ?", [result.lastInsertRowid]);
    if (!habit) throw new Error("Failed to create habit");
    return habit;
  } catch (error) {
    console.error("Error creating habit:", error);
    throw error;
  }
}

/**
 * Update a habit
 */
export function updateHabit(id: number, userId: string, data: {
  title?: string;
  description?: string;
  frequency?: string;
  target?: number;
  active?: boolean;
  order_index?: number;
}): Habit {
  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.frequency !== undefined) {
      updates.push("frequency = ?");
      values.push(data.frequency);
    }
    if (data.target !== undefined) {
      updates.push("target = ?");
      values.push(data.target);
    }
    if (data.active !== undefined) {
      updates.push("active = ?");
      values.push(data.active ? 1 : 0);
    }
    if (data.order_index !== undefined) {
      updates.push("order_index = ?");
      values.push(data.order_index);
    }

    if (updates.length === 0) throw new Error("No updates provided");

    values.push(id);
    values.push(userId);

    execute(
      `UPDATE habits SET ${updates.join(", ")} WHERE id = ? AND userId = ?`,
      values
    );

    const habit = queryOne<Habit>("SELECT * FROM habits WHERE id = ?", [id]);
    if (!habit) throw new Error("Habit not found");
    return habit;
  } catch (error) {
    console.error("Error updating habit:", error);
    throw error;
  }
}

/**
 * Delete a habit
 */
export function deleteHabit(id: number, userId: string): boolean {
  try {
    const result = execute("DELETE FROM habits WHERE id = ? AND userId = ?", [id, userId]);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting habit:", error);
    return false;
  }
}

/**
 * Get habit completions for a specific date
 */
export function getHabitCompletions(userId: string, date: string): HabitCompletion[] {
  try {
    return query<HabitCompletion>(
      "SELECT * FROM habit_completions WHERE userId = ? AND date = ?",
      [userId, date]
    );
  } catch (error) {
    console.error("Error getting habit completions:", error);
    return [];
  }
}

/**
 * Get habit completions for a date range
 */
export function getHabitCompletionsForRange(userId: string, startDate: string, endDate: string): HabitCompletion[] {
  try {
    return query<HabitCompletion>(
      "SELECT * FROM habit_completions WHERE userId = ? AND date >= ? AND date <= ?",
      [userId, startDate, endDate]
    );
  } catch (error) {
    console.error("Error getting habit completions range:", error);
    return [];
  }
}

/**
 * Toggle habit completion
 */
export function toggleHabitCompletion(habitId: number, userId: string, date: string): boolean {
  try {
    // Check if already completed
    const existing = queryOne<HabitCompletion>(
      "SELECT * FROM habit_completions WHERE habit_id = ? AND date = ?",
      [habitId, date]
    );

    if (existing) {
      // Remove completion
      execute("DELETE FROM habit_completions WHERE id = ?", [existing.id]);
      return false; // Not completed anymore
    } else {
      // Add completion
      execute(
        "INSERT INTO habit_completions (habit_id, userId, date) VALUES (?, ?, ?)",
        [habitId, userId, date]
      );
      return true; // Completed
    }
  } catch (error) {
    console.error("Error toggling habit completion:", error);
    throw error;
  }
}
