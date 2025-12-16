import { execute, query, queryOne } from "./index";
import { checkAchievement } from "../achievements";

// Predefined task statuses
export const PREDEFINED_TASK_STATUSES = [
  'active',
  'in_progress',
  'blocked',
  'on_hold',
  'cancelled',
  'completed'
] as const;

export type PredefinedTaskStatus = typeof PREDEFINED_TASK_STATUSES[number];
export type TaskStatus = PredefinedTaskStatus | string; // Allow custom statuses

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean; // Kept for backward compatibility, synced with status
  completed_date: string | null; // YYYY-MM-DD format
  due_date: string | null; // ISO 8601 format
  priority: TaskPriority;
  category: string | null;
  status: TaskStatus;
  userId: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFilter {
  completed?: boolean;
  status?: TaskStatus | TaskStatus[];
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

export interface TaskStatusRecord {
  id: number;
  userId: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Check if a task status represents a completed state
 */
export function isStatusCompleted(status: TaskStatus): boolean {
  return status.toLowerCase() === 'completed';
}

/**
 * Get the computed completed boolean from status
 */
export function getCompletedFromStatus(status: TaskStatus): boolean {
  return isStatusCompleted(status);
}

/**
 * Create a new task
 */
export async function createTask(
  title: string,
  dueDate?: string,
  priority: TaskPriority = "medium",
  category?: string,
  userId?: string,
  description?: string,
  status: TaskStatus = "active"
): Promise<Task> {
  const result = await execute(
    "INSERT INTO tasks (title, description, due_date, priority, category, status, userId, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      title,
      description || null,
      dueDate || null,
      priority,
      category || null,
      status,
      userId || null,
      isStatusCompleted(status) ? 1 : 0 // Auto-set completed boolean
    ]
  );

  const task = await queryOne<Task>("SELECT * FROM tasks WHERE id = ?", [result.lastInsertRowid]);
  if (!task) {
    throw new Error("Failed to create task");
  }

  return task;
}

/**
 * Get task by ID for a specific user
 */
export async function getTask(id: number, userId: string): Promise<Task | undefined> {
  return await queryOne<Task>("SELECT * FROM tasks WHERE id = ? AND userId = ?", [id, userId]);
}

/**
 * Get all tasks with optional filtering
 */
export async function getAllTasks(filter?: TaskFilter, userId?: string): Promise<Task[]> {
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

  if (filter?.status !== undefined) {
    if (Array.isArray(filter.status)) {
      sql += ` AND status IN (${filter.status.map(() => '?').join(',')})`;
      params.push(...filter.status);
    } else {
      sql += " AND status = ?";
      params.push(filter.status);
    }
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

  sql += " ORDER BY completed ASC, status ASC, due_date ASC NULLS LAST, priority DESC, created_at DESC";

  return await query<Task>(sql, params);
}

/**
 * Get active (incomplete) tasks
 */
export async function getActiveTasks(): Promise<Task[]> {
  return getAllTasks({ completed: false });
}

/**
 * Get completed tasks
 */
export async function getCompletedTasks(): Promise<Task[]> {
  return getAllTasks({ completed: true });
}

/**
 * Get tasks due today or overdue for a specific user
 */
export async function getUpcomingTasks(userId: string): Promise<Task[]> {
  const today = new Date().toISOString().split("T")[0];
  return await query<Task>(
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
export async function updateTask(
  id: number,
  updates: Partial<Pick<Task, "title" | "description" | "completed" | "status" | "due_date" | "priority" | "category">>
): Promise<boolean> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    params.push(updates.title);
  }

  if (updates.description !== undefined) {
    fields.push("description = ?");
    params.push(updates.description);
  }

  // Handle status updates (takes priority over completed)
  if (updates.status !== undefined) {
    fields.push("status = ?");
    params.push(updates.status);

    // Auto-update completed boolean based on status
    const isCompleted = isStatusCompleted(updates.status);
    fields.push("completed = ?");
    params.push(isCompleted ? 1 : 0);

    // Set/clear completed_date based on status
    if (isCompleted) {
      const today = new Date().toISOString().split("T")[0];
      fields.push("completed_date = ?");
      params.push(today);
    } else {
      fields.push("completed_date = ?");
      params.push(null);
    }
  } else if (updates.completed !== undefined) {
    // Handle direct completed boolean update (backward compatibility)
    fields.push("completed = ?");
    params.push(updates.completed ? 1 : 0);

    // Also update status to match
    const newStatus = updates.completed ? 'completed' : 'active';
    fields.push("status = ?");
    params.push(newStatus);

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
  const result = await execute(sql, params);

  if (result.changes > 0) {
    // Check for achievements if status changed to completed
    if (updates.status && isStatusCompleted(updates.status)) {
      const task = await queryOne<Task>("SELECT * FROM tasks WHERE id = ?", [id]);
      if (task && task.userId) {
        checkAchievement(task.userId, 'tasks').catch(console.error);
      }
    } else if (updates.completed === true) {
      // Also check if completed was set directly (backward compatibility)
      const task = await queryOne<Task>("SELECT * FROM tasks WHERE id = ?", [id]);
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
export async function toggleTaskComplete(id: number, userId: string): Promise<boolean> {
  const task = await getTask(id, userId);
  if (!task) {
    return false;
  }

  return updateTask(id, { completed: !task.completed });
}

/**
 * Delete task with ownership verification
 */
export async function deleteTask(id: number, userId: string): Promise<boolean> {
  // Verify ownership
  const existing = getTask(id, userId);
  if (!existing) {
    return false;
  }

  const result = await execute("DELETE FROM tasks WHERE id = ? AND userId = ?", [id, userId]);
  return result.changes > 0;
}

/**
 * Delete all completed tasks for a specific user
 */
export async function deleteCompletedTasks(userId: string): Promise<number> {
  const result = await execute("DELETE FROM tasks WHERE completed = 1 AND userId = ?", [userId]);
  return result.changes;
}

/**
 * Get task statistics for a specific user
 */
export async function getTaskStatistics(userId: string): Promise<{
  total: number;
  completed: number;
  active: number;
  overdue: number;
  byPriority: Record<TaskPriority, number>;
}> {
  const tasks = await getAllTasks({}, userId);
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
export async function getAllTaskCategories(): Promise<TaskCategory[]> {
  return await query<TaskCategory>(
    "SELECT * FROM task_categories ORDER BY name ASC"
  );
}

/**
 * Create a new task category
 */
export async function createTaskCategory(userId: string, name: string): Promise<TaskCategory> {
  const result = await execute(
    "INSERT INTO task_categories (userId, name) VALUES (?, ?)",
    [userId, name]
  );

  const category = (await query<TaskCategory>(
    "SELECT * FROM task_categories WHERE id = ?",
    [result.lastInsertRowid]
  ))[0];

  if (!category) {
    throw new Error("Failed to create category");
  }

  return category;
}

/**
 * Delete a task category
 * This will set category to NULL for all tasks using this category
 */
export async function deleteTaskCategory(id: number): Promise<boolean> {
  // First, clear the category from all tasks using it
  const category = (await query<TaskCategory>(
    "SELECT * FROM task_categories WHERE id = ?",
    [id]
  ))[0];

  if (category) {
    await execute("UPDATE tasks SET category = NULL WHERE category = ?", [category.name]);
  }

  // Then delete the category
  const result = await execute("DELETE FROM task_categories WHERE id = ?", [id]);
  return result.changes > 0;
}

/**
 * Rename a task category
 * This will update all tasks using the old category name to the new name
 */
export async function renameTaskCategory(id: number, newName: string): Promise<boolean> {
  const category = (await query<TaskCategory>(
    "SELECT * FROM task_categories WHERE id = ?",
    [id]
  ))[0];

  if (!category) {
    return false;
  }

  // Update all tasks using this category
  await execute("UPDATE tasks SET category = ? WHERE category = ?", [newName, category.name]);

  // Update the category name
  const result = await execute(
    "UPDATE task_categories SET name = ? WHERE id = ?",
    [newName, id]
  );

  return result.changes > 0;
}

/**
 * Initialize default categories for a user if they don't have any
 * This is idempotent - safe to call multiple times
 */
export async function ensureDefaultCategories(userId: string): Promise<void> {
  // Check if user already has categories
  const existingCategories = await query<TaskCategory>(
    "SELECT * FROM task_categories WHERE userId = ? LIMIT 1",
    [userId]
  );

  // If user already has categories, don't add defaults
  if (existingCategories.length > 0) {
    return;
  }

  // Default categories to create for new users
  const defaultCategories = [
    "Work",
    "Personal",
    "Family",
    "Home",
    "Shopping",
    "Finance",
    "Health",
    "Travel"
  ];

  // Create all default categories
  for (const categoryName of defaultCategories) {
    try {
      await execute(
        "INSERT OR IGNORE INTO task_categories (userId, name) VALUES (?, ?)",
        [userId, categoryName]
      );
    } catch (error) {
      // Silently ignore errors (e.g., if category already exists)
      console.error(`Failed to create default category "${categoryName}":`, error);
    }
  }
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
export async function getTaskVelocityData(
  userId: string,
  period: VelocityPeriod = "week",
  numPeriods: number = 12
): Promise<TaskVelocityData> {
  const now = new Date();
  const dataPoints: TaskVelocityDataPoint[] = [];

  // Calculate date ranges for each period
  for (let i = numPeriods - 1; i >= 0; i--) {
    const { startDate, endDate, label } = getPeriodRange(now, period, i);

    // Count tasks completed in this period
    const completedCount = (await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM tasks
       WHERE userId = ?
       AND completed_date IS NOT NULL
       AND completed_date >= ?
       AND completed_date <= ?`,
      [userId, startDate, endDate]
    ))[0]?.count || 0;

    // Count tasks created with due dates in this period (planned work)
    const plannedCount = (await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM tasks
       WHERE userId = ?
       AND due_date IS NOT NULL
       AND due_date >= ?
       AND due_date <= ?`,
      [userId, startDate, endDate]
    ))[0]?.count || 0;

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

// ==================== Task Statuses ====================

/**
 * Get all task statuses (predefined + user custom) for a user
 */
export async function getAllTaskStatuses(userId: string): Promise<{ predefined: PredefinedTaskStatus[]; custom: TaskStatusRecord[] }> {
  const customStatuses = await query<TaskStatusRecord>(
    "SELECT * FROM task_statuses WHERE userId = ? ORDER BY name ASC",
    [userId]
  );

  return {
    predefined: [...PREDEFINED_TASK_STATUSES],
    custom: customStatuses
  };
}

/**
 * Get only custom statuses for a user
 */
export async function getCustomTaskStatuses(userId: string): Promise<TaskStatusRecord[]> {
  return await query<TaskStatusRecord>(
    "SELECT * FROM task_statuses WHERE userId = ? ORDER BY name ASC",
    [userId]
  );
}

/**
 * Create a custom task status
 */
export async function createTaskStatus(userId: string, name: string, color?: string): Promise<TaskStatusRecord> {
  const result = await execute(
    "INSERT INTO task_statuses (userId, name, color) VALUES (?, ?, ?)",
    [userId, name, color || null]
  );

  const status = await queryOne<TaskStatusRecord>(
    "SELECT * FROM task_statuses WHERE id = ?",
    [result.lastInsertRowid]
  );

  if (!status) {
    throw new Error("Failed to create task status");
  }

  return status;
}

/**
 * Update a custom task status
 */
export async function updateTaskStatus(id: number, userId: string, updates: { name?: string; color?: string }): Promise<boolean> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    params.push(updates.name);
  }

  if (updates.color !== undefined) {
    fields.push("color = ?");
    params.push(updates.color);
  }

  if (fields.length === 0) {
    return false;
  }

  params.push(id);
  params.push(userId);

  const sql = `UPDATE task_statuses SET ${fields.join(", ")} WHERE id = ? AND userId = ?`;
  const result = await execute(sql, params);

  return result.changes > 0;
}

/**
 * Delete a custom task status
 * This will set status back to 'active' for all tasks using this status
 */
export async function deleteTaskStatus(id: number, userId: string): Promise<boolean> {
  // First, get the status name
  const status = await queryOne<TaskStatusRecord>(
    "SELECT * FROM task_statuses WHERE id = ? AND userId = ?",
    [id, userId]
  );

  if (status) {
    // Update all tasks using this status to 'active'
    await execute(
      "UPDATE tasks SET status = 'active' WHERE status = ? AND userId = ?",
      [status.name, userId]
    );
  }

  // Then delete the status
  const result = await execute(
    "DELETE FROM task_statuses WHERE id = ? AND userId = ?",
    [id, userId]
  );

  return result.changes > 0;
}

/**
 * Validate if a status name is valid for a user (predefined or custom)
 */
export async function isValidTaskStatus(userId: string, statusName: string): Promise<boolean> {
  // Check if it's a predefined status
  if (PREDEFINED_TASK_STATUSES.includes(statusName as PredefinedTaskStatus)) {
    return true;
  }

  // Check if it's a custom status for this user
  const customStatus = await queryOne<TaskStatusRecord>(
    "SELECT * FROM task_statuses WHERE userId = ? AND name = ?",
    [userId, statusName]
  );

  return !!customStatus;
}
