import { execute, query, queryOne } from "./index";
import { checkAchievement } from "../achievements";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  completed_date: string | null; // YYYY-MM-DD format
  due_date: string | null; // ISO 8601 format
  priority: TaskPriority;
  category: string | null;
  userId: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFilter {
  completed?: boolean;
  priority?: TaskPriority;
  category?: string;
  search?: string;
}

export interface TaskCategory {
  id: number;
  userId: string;
  name: string;
  created_at: string;
}

/**
 * Create a new task
 */
export function createTask(
  title: string,
  dueDate?: string,
  priority: TaskPriority = "medium",
  category?: string,
  userId?: string
): Task {
  const result = execute(
    "INSERT INTO tasks (title, due_date, priority, category, userId) VALUES (?, ?, ?, ?, ?)",
    [title, dueDate || null, priority, category || null, userId || null]
  );

  const task = getTask(Number(result.lastInsertRowid));
  if (!task) {
    throw new Error("Failed to create task");
  }

  return task;
}

/**
 * Get task by ID for a specific user
 */
export function getTask(id: number, userId: string): Task | undefined {
  return queryOne<Task>("SELECT * FROM tasks WHERE id = ? AND userId = ?", [id, userId]);
}

/**
 * Get all tasks with optional filtering
 */
export function getAllTasks(filter?: TaskFilter, userId?: string): Task[] {
  let sql = "SELECT * FROM tasks WHERE 1=1";
  const params: unknown[] = [];

  // Filter by userId if provided
  if (userId) {
    sql += " AND userId = ?";
    params.push(userId);
  }

  if (filter?.completed !== undefined) {
    sql += " AND completed = ?";
    params.push(filter.completed ? 1 : 0);
  }

  if (filter?.priority) {
    sql += " AND priority = ?";
    params.push(filter.priority);
  }

  if (filter?.category !== undefined) {
    if (filter.category === null || filter.category === "") {
      sql += " AND category IS NULL";
    } else {
      sql += " AND category = ?";
      params.push(filter.category);
    }
  }

  if (filter?.search) {
    sql += " AND title LIKE ?";
    params.push(`%${filter.search}%`);
  }

  sql += " ORDER BY completed ASC, due_date ASC NULLS LAST, priority DESC, created_at DESC";

  return query<Task>(sql, params);
}

/**
 * Get active (incomplete) tasks
 */
export function getActiveTasks(): Task[] {
  return getAllTasks({ completed: false });
}

/**
 * Get completed tasks
 */
export function getCompletedTasks(): Task[] {
  return getAllTasks({ completed: true });
}

/**
 * Get tasks due today or overdue for a specific user
 */
export function getUpcomingTasks(userId: string): Task[] {
  const today = new Date().toISOString().split("T")[0];
  return query<Task>(
    `SELECT * FROM tasks
     WHERE userId = ?
     AND completed = 0
     AND due_date IS NOT NULL
     AND due_date <= ?
     ORDER BY due_date ASC`,
    [userId, today]
  );
}

/**
 * Update task
 */
export function updateTask(
  id: number,
  updates: Partial<Pick<Task, "title" | "completed" | "due_date" | "priority" | "category">>
): boolean {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    params.push(updates.title);
  }

  if (updates.completed !== undefined) {
    fields.push("completed = ?");
    params.push(updates.completed ? 1 : 0);

    // Set completed_date when marking task as complete
    if (updates.completed) {
      const today = new Date().toISOString().split("T")[0];
      fields.push("completed_date = ?");
      params.push(today);
    } else {
      // Clear completed_date when marking task as incomplete
      fields.push("completed_date = ?");
      params.push(null);
    }
  }

  if (updates.due_date !== undefined) {
    fields.push("due_date = ?");
    params.push(updates.due_date);
  }

  if (updates.priority !== undefined) {
    fields.push("priority = ?");
    params.push(updates.priority);
  }

  if (updates.category !== undefined) {
    fields.push("category = ?");
    params.push(updates.category);
  }

  if (fields.length === 0) {
    return false;
  }

  params.push(id);
  const sql = `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`;
  const result = execute(sql, params);

  if (result.changes > 0) {
    // Check for achievements if completed status changed to true
    if (updates.completed === true) {
      // Need userId. Fetch task to get it.
      const task = getTask(id);
      if (task && task.userId) {
        checkAchievement(task.userId, 'tasks').catch(console.error);
      }
    }
  }

  return result.changes > 0;
}

/**
 * Toggle task completion status with ownership verification
 */
export function toggleTaskComplete(id: number, userId: string): boolean {
  const task = getTask(id, userId);
  if (!task) {
    return false;
  }

  return updateTask(id, { completed: !task.completed });
}

/**
 * Delete task with ownership verification
 */
export function deleteTask(id: number, userId: string): boolean {
  // Verify ownership
  const existing = getTask(id, userId);
  if (!existing) {
    return false;
  }

  const result = execute("DELETE FROM tasks WHERE id = ? AND userId = ?", [id, userId]);
  return result.changes > 0;
}

/**
 * Delete all completed tasks for a specific user
 */
export function deleteCompletedTasks(userId: string): number {
  const result = execute("DELETE FROM tasks WHERE completed = 1 AND userId = ?", [userId]);
  return result.changes;
}

/**
 * Get task statistics for a specific user
 */
export function getTaskStatistics(userId: string): {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  byPriority: Record<TaskPriority, number>;
} {
  const tasks = getAllTasks({}, userId);
  const today = new Date().toISOString().split("T")[0];

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    active: tasks.filter((t) => !t.completed).length,
    overdue: tasks.filter(
      (t) => !t.completed && t.due_date && t.due_date < today
    ).length,
    byPriority: { low: 0, medium: 0, high: 0 } as Record<TaskPriority, number>,
  };

  tasks.forEach((task) => {
    stats.byPriority[task.priority]++;
  });

  return stats;
}

// ==================== Task Categories ====================

/**
 * Get all task categories for the current user
 */
export function getAllTaskCategories(): TaskCategory[] {
  return query<TaskCategory>(
    "SELECT * FROM task_categories ORDER BY name ASC"
  );
}

/**
 * Create a new task category
 */
export function createTaskCategory(name: string): TaskCategory {
  const result = execute(
    "INSERT INTO task_categories (name) VALUES (?)",
    [name]
  );

  const category = query<TaskCategory>(
    "SELECT * FROM task_categories WHERE id = ?",
    [result.lastInsertRowid]
  )[0];

  if (!category) {
    throw new Error("Failed to create category");
  }

  return category;
}

/**
 * Delete a task category
 * This will set category to NULL for all tasks using this category
 */
export function deleteTaskCategory(id: number): boolean {
  // First, clear the category from all tasks using it
  const category = query<TaskCategory>(
    "SELECT * FROM task_categories WHERE id = ?",
    [id]
  )[0];

  if (category) {
    execute("UPDATE tasks SET category = NULL WHERE category = ?", [category.name]);
  }

  // Then delete the category
  const result = execute("DELETE FROM task_categories WHERE id = ?", [id]);
  return result.changes > 0;
}

/**
 * Rename a task category
 * This will update all tasks using the old category name to the new name
 */
export function renameTaskCategory(id: number, newName: string): boolean {
  const category = query<TaskCategory>(
    "SELECT * FROM task_categories WHERE id = ?",
    [id]
  )[0];

  if (!category) {
    return false;
  }

  // Update all tasks using this category
  execute("UPDATE tasks SET category = ? WHERE category = ?", [newName, category.name]);

  // Update the category name
  const result = execute(
    "UPDATE task_categories SET name = ? WHERE id = ?",
    [newName, id]
  );

  return result.changes > 0;
}

// ==================== Task Velocity ====================

export type VelocityPeriod = "day" | "week" | "month";

export interface TaskVelocityDataPoint {
  label: string;
  startDate: string;
  endDate: string;
  planned: number;
  completed: number;
  completionRate: number;
}

export interface TaskVelocityStats {
  avgCompleted: number;
  avgPlanned: number;
  totalCompleted: number;
  totalPlanned: number;
  trend: number; // percentage change comparing recent vs earlier period
  bestPeriod: string;
  bestPeriodCount: number;
}

export interface TaskVelocityData {
  dataPoints: TaskVelocityDataPoint[];
  stats: TaskVelocityStats;
  period: VelocityPeriod;
}

/**
 * Get task velocity data for charting for a specific user
 * Shows tasks completed and planned (created with due date) over time
 */
export function getTaskVelocityData(
  userId: string,
  period: VelocityPeriod = "week",
  numPeriods: number = 12
): TaskVelocityData {
  const now = new Date();
  const dataPoints: TaskVelocityDataPoint[] = [];

  // Calculate date ranges for each period
  for (let i = numPeriods - 1; i >= 0; i--) {
    const { startDate, endDate, label } = getPeriodRange(now, period, i);

    // Count tasks completed in this period
    const completedCount = query<{ count: number }>(
      `SELECT COUNT(*) as count FROM tasks
       WHERE userId = ?
       AND completed_date IS NOT NULL
       AND completed_date >= ?
       AND completed_date <= ?`,
      [userId, startDate, endDate]
    )[0]?.count || 0;

    // Count tasks created with due dates in this period (planned work)
    const plannedCount = query<{ count: number }>(
      `SELECT COUNT(*) as count FROM tasks
       WHERE userId = ?
       AND due_date IS NOT NULL
       AND due_date >= ?
       AND due_date <= ?`,
      [userId, startDate, endDate]
    )[0]?.count || 0;

    const completionRate = plannedCount > 0
      ? Math.round((completedCount / plannedCount) * 100)
      : completedCount > 0 ? 100 : 0;

    dataPoints.push({
      label,
      startDate,
      endDate,
      planned: plannedCount,
      completed: completedCount,
      completionRate,
    });
  }

  // Calculate stats
  const totalCompleted = dataPoints.reduce((sum, d) => sum + d.completed, 0);
  const totalPlanned = dataPoints.reduce((sum, d) => sum + d.planned, 0);
  const avgCompleted = Math.round(totalCompleted / numPeriods * 10) / 10;
  const avgPlanned = Math.round(totalPlanned / numPeriods * 10) / 10;

  // Find best period
  const bestPeriodData = dataPoints.reduce((best, current) =>
    current.completed > best.completed ? current : best
  , dataPoints[0]);

  // Calculate trend (compare second half to first half)
  const midpoint = Math.floor(numPeriods / 2);
  const firstHalf = dataPoints.slice(0, midpoint);
  const secondHalf = dataPoints.slice(midpoint);
  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.completed, 0) / firstHalf.length || 0;
  const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.completed, 0) / secondHalf.length || 0;
  const trend = firstHalfAvg > 0
    ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
    : secondHalfAvg > 0 ? 100 : 0;

  return {
    dataPoints,
    stats: {
      avgCompleted,
      avgPlanned,
      totalCompleted,
      totalPlanned,
      trend,
      bestPeriod: bestPeriodData?.label || "",
      bestPeriodCount: bestPeriodData?.completed || 0,
    },
    period,
  };
}

/**
 * Helper to get date range and label for a period
 */
function getPeriodRange(
  now: Date,
  period: VelocityPeriod,
  periodsAgo: number
): { startDate: string; endDate: string; label: string } {
  const start = new Date(now);
  const end = new Date(now);

  if (period === "day") {
    start.setDate(now.getDate() - periodsAgo);
    end.setDate(now.getDate() - periodsAgo);
    const label = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
      label,
    };
  }

  if (period === "week") {
    // Go to the start of the current week (Sunday) then go back periodsAgo weeks
    const dayOfWeek = now.getDay();
    start.setDate(now.getDate() - dayOfWeek - (periodsAgo * 7));
    end.setDate(start.getDate() + 6);
    const weekLabel = `W${getWeekNumber(start)}`;
    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
      label: weekLabel,
    };
  }

  // month
  start.setMonth(now.getMonth() - periodsAgo, 1);
  end.setMonth(start.getMonth() + 1, 0); // Last day of month
  const label = start.toLocaleDateString("en-US", { month: "short" });
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
    label,
  };
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDays = (date.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
}
