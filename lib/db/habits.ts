import { getDatabase, query, queryOne, execute } from "@/lib/db";
import {
  parseISO,
  startOfWeek,
  startOfMonth,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
} from "date-fns";

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

export interface HabitStats {
  daysExisted: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
}

/**
 * Calculate habit statistics
 */
/**
 * Calculate habit statistics
 */
export function getHabitStats(habit: Habit, userId: string): HabitStats {
  try {
    const { frequency = 'daily', target = 1, created_at } = habit;
    
    // Calculate days existed
    const createdAtDateStr = created_at.split('T')[0].split(' ')[0];
    const [year, month, day] = createdAtDateStr.split('-').map(Number);
    const createdDate = new Date(year, month - 1, day);
    const today = new Date();
    const createdMidnight = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const daysExisted = Math.floor((todayMidnight.getTime() - createdMidnight.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Get all completions
    const completions = query<HabitCompletion>(
      "SELECT date FROM habit_completions WHERE habit_id = ? AND userId = ? ORDER BY date DESC",
      [habit.id, userId]
    );

    if (completions.length === 0) {
      return {
        daysExisted,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
      };
    }

    // Group completions by period and validate against target
    const validPeriods: number[] = []; // Timestamps of start of period
    const isWeekly = ['three_times_a_week', 'once_a_week', 'every_week'].includes(frequency);
    const isMonthly = frequency === 'monthly';
    const isDaily = frequency === 'daily' || frequency === 'every_other_day';

    if (isDaily) {
      const counts = new Map<string, number>();
      completions.forEach(c => {
        counts.set(c.date, (counts.get(c.date) || 0) + 1);
      });
      
      for (const [date, count] of counts) {
        if (count >= target) {
          // Use noon to avoid timezone issues when converting back/forth
          const d = parseISO(date);
          validPeriods.push(d.getTime());
        }
      }
    } else if (isWeekly) {
      const counts = new Map<string, number>();
      completions.forEach(c => {
        const date = parseISO(c.date);
        const weekStart = startOfWeek(date, { weekStartsOn: 1 }).getTime();
        counts.set(weekStart.toString(), (counts.get(weekStart.toString()) || 0) + 1);
      });

      for (const [weekStartStr, count] of counts) {
        if (count >= target) {
          validPeriods.push(Number(weekStartStr));
        }
      }
    } else if (isMonthly) {
      const counts = new Map<string, number>();
      completions.forEach(c => {
        const date = parseISO(c.date);
        const monthStart = startOfMonth(date).getTime();
        counts.set(monthStart.toString(), (counts.get(monthStart.toString()) || 0) + 1);
      });

      for (const [monthStartStr, count] of counts) {
        if (count >= target) {
          validPeriods.push(Number(monthStartStr));
        }
      }
    }

    validPeriods.sort((a, b) => b - a); // Descending

    if (validPeriods.length === 0) {
      return {
        daysExisted,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: completions.length,
      };
    }

    // Calculate Current Streak
    let currentStreak = 0;
    const latestValid = validPeriods[0];
    let isAlive = false;

    if (frequency === 'daily') {
      const diff = differenceInCalendarDays(today, latestValid);
      if (diff <= 1) isAlive = true; // Today or Yesterday
    } else if (frequency === 'every_other_day') {
      const diff = differenceInCalendarDays(today, latestValid);
      if (diff <= 2) isAlive = true; // Today, Yesterday, or Day Before
    } else if (isWeekly) {
      const thisWeek = startOfWeek(today, { weekStartsOn: 1 });
      const diff = differenceInCalendarWeeks(thisWeek, latestValid, { weekStartsOn: 1 });
      if (diff <= 1) isAlive = true; // This week or Last week
    } else if (isMonthly) {
      const thisMonth = startOfMonth(today);
      const diff = differenceInCalendarMonths(thisMonth, latestValid);
      if (diff <= 1) isAlive = true; // This month or Last month
    }

    if (isAlive) {
      currentStreak = 1;
      for (let i = 0; i < validPeriods.length - 1; i++) {
        const current = validPeriods[i];
        const next = validPeriods[i+1];
        
        let diff;
        let consecutive = false;

        if (frequency === 'daily') {
          diff = differenceInCalendarDays(current, next);
          if (diff === 1) consecutive = true;
        } else if (frequency === 'every_other_day') {
          diff = differenceInCalendarDays(current, next);
          if (diff <= 2) consecutive = true;
        } else if (isWeekly) {
          diff = differenceInCalendarWeeks(current, next, { weekStartsOn: 1 });
          if (diff === 1) consecutive = true;
        } else if (isMonthly) {
          diff = differenceInCalendarMonths(current, next);
          if (diff === 1) consecutive = true;
        }

        if (consecutive) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate Longest Streak
    let longestStreak = 0;
    if (validPeriods.length > 0) {
      let tempStreak = 1;
      // Iterate ascending for longest streak calculation
      const sortedAsc = [...validPeriods].sort((a, b) => a - b);
      
      for (let i = 0; i < sortedAsc.length - 1; i++) {
        const current = sortedAsc[i];
        const next = sortedAsc[i+1];
        
        let diff;
        let consecutive = false;

        if (frequency === 'daily') {
          diff = differenceInCalendarDays(next, current);
          if (diff === 1) consecutive = true;
        } else if (frequency === 'every_other_day') {
          diff = differenceInCalendarDays(next, current);
          if (diff <= 2) consecutive = true;
        } else if (isWeekly) {
          diff = differenceInCalendarWeeks(next, current, { weekStartsOn: 1 });
          if (diff === 1) consecutive = true;
        } else if (isMonthly) {
          diff = differenceInCalendarMonths(next, current);
          if (diff === 1) consecutive = true;
        }

        if (consecutive) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      daysExisted,
      currentStreak,
      longestStreak,
      totalCompletions: completions.length,
    };
  } catch (error) {
    console.error("Error calculating habit stats:", error);
    return {
      daysExisted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
    };
  }
}
