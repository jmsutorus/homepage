import { getDatabase, query, queryOne, execute } from "@/lib/db";
import {
  parseISO,
  startOfWeek,
  startOfMonth,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
} from "date-fns";
import { checkAchievement } from "../achievements";

export interface Habit {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  frequency: string;
  target: number;
  active: boolean;
  completed: boolean;
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
  completed?: boolean;
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
    if (data.completed !== undefined) {
      updates.push("completed = ?");
      values.push(data.completed ? 1 : 0);
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
      // Check for achievements
      checkAchievement(userId, 'habits').catch(console.error);
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

    // Get all completions (sorted by date descending)
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

    // Determine max allowed gap between completions based on frequency
    let maxGapDays: number;
    let streakAliveWindow: number; // Days from today to consider streak alive

    switch (frequency) {
      case 'daily':
        maxGapDays = 1; // Must be consecutive days
        streakAliveWindow = 1; // Today or yesterday
        break;
      case 'every_other_day':
        maxGapDays = 2; // Can skip max 1 day between completions
        streakAliveWindow = 2; // Within last 2 days
        break;
      case 'three_times_a_week':
      case 'once_a_week':
      case 'every_week':
        maxGapDays = 7; // Can skip max 6 days between completions
        streakAliveWindow = 7; // Within last week
        break;
      case 'monthly':
        maxGapDays = 31; // Can skip max 30 days between completions
        streakAliveWindow = 31; // Within last month
        break;
      default:
        maxGapDays = 1;
        streakAliveWindow = 1;
    }

    // Convert completion dates to Date objects
    const completionDates = completions.map(c => parseISO(c.date));

    // Check if streak is alive (most recent completion is within the window from today)
    const mostRecentCompletion = completionDates[0];
    const daysSinceLastCompletion = differenceInCalendarDays(today, mostRecentCompletion);
    const isStreakAlive = daysSinceLastCompletion <= streakAliveWindow;

    // Calculate Current Streak
    let currentStreak = 0;
    if (isStreakAlive) {
      currentStreak = 1; // Count the most recent completion

      // Count backwards through completions
      for (let i = 0; i < completionDates.length - 1; i++) {
        const currentDate = completionDates[i];
        const nextDate = completionDates[i + 1];

        const gap = differenceInCalendarDays(currentDate, nextDate);

        // If gap is within allowed range, continue the streak
        if (gap <= maxGapDays) {
          currentStreak++;
        } else {
          // Streak is broken
          break;
        }
      }
    }

    // Calculate Longest Streak
    let longestStreak = 0;
    let tempStreak = 1;

    // Iterate through completions in chronological order (oldest to newest)
    const chronologicalDates = [...completionDates].reverse();

    for (let i = 0; i < chronologicalDates.length - 1; i++) {
      const currentDate = chronologicalDates[i];
      const nextDate = chronologicalDates[i + 1];

      const gap = differenceInCalendarDays(nextDate, currentDate);

      if (gap <= maxGapDays) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

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

export interface HabitCompletionChartData {
  habitId: number;
  habitTitle: string;
  weeklyData: {
    week: string;
    weekLabel: string;
    completions: number;
    target: number;
    rate: number;
  }[];
  stats: HabitStats;
}

/**
 * Get habit completion data for charts (last 12 weeks)
 */
export function getHabitCompletionsForChart(userId: string): HabitCompletionChartData[] {
  try {
    const habits = getHabits(userId);
    const today = new Date();

    // Calculate the start of 12 weeks ago
    const weeksToShow = 12;
    const startDate = startOfWeek(new Date(today.getTime() - (weeksToShow - 1) * 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 0 });
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];

    return habits.map(habit => {
      const completions = getHabitCompletionsForRange(userId, startDateStr, endDateStr)
        .filter(c => c.habit_id === habit.id);

      // Group completions by week
      const weeklyMap: Map<string, number> = new Map();

      // Initialize all weeks
      for (let i = 0; i < weeksToShow; i++) {
        const weekStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        const weekKey = weekStart.toISOString().split('T')[0];
        weeklyMap.set(weekKey, 0);
      }

      // Count completions per week
      completions.forEach(completion => {
        const completionDate = parseISO(completion.date);
        const weekStart = startOfWeek(completionDate, { weekStartsOn: 0 });
        const weekKey = weekStart.toISOString().split('T')[0];
        if (weeklyMap.has(weekKey)) {
          weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + 1);
        }
      });

      // Calculate weekly target based on frequency
      let weeklyTarget = 7; // Default for daily
      switch (habit.frequency) {
        case 'daily':
          weeklyTarget = 7;
          break;
        case 'every_other_day':
          weeklyTarget = 3;
          break;
        case 'three_times_a_week':
          weeklyTarget = 3;
          break;
        case 'once_a_week':
        case 'every_week':
          weeklyTarget = 1;
          break;
        case 'monthly':
          weeklyTarget = 0.25; // Roughly 1 per 4 weeks
          break;
        default:
          weeklyTarget = 7;
      }

      // Convert map to array with labels
      const weeklyData = Array.from(weeklyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([week, count], index) => {
          const weekDate = parseISO(week);
          return {
            week,
            weekLabel: `W${index + 1}`,
            completions: count,
            target: Math.round(weeklyTarget),
            rate: weeklyTarget > 0 ? Math.min(100, Math.round((count / weeklyTarget) * 100)) : 100,
          };
        });

      return {
        habitId: habit.id,
        habitTitle: habit.title,
        weeklyData,
        stats: getHabitStats(habit, userId),
      };
    });
  } catch (error) {
    console.error("Error getting habit completions for chart:", error);
    return [];
  }
}
