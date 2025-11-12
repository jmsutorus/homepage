import { execute, query, queryOne } from "./index";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  completed_date: string | null; // YYYY-MM-DD format
  due_date: string | null; // ISO 8601 format
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface TaskFilter {
  completed?: boolean;
  priority?: TaskPriority;
  search?: string;
}

/**
 * Create a new task
 */
export function createTask(
  title: string,
  dueDate?: string,
  priority: TaskPriority = "medium"
): Task {
  const result = execute(
    "INSERT INTO tasks (title, due_date, priority) VALUES (?, ?, ?)",
    [title, dueDate || null, priority]
  );

  const task = getTask(Number(result.lastInsertRowid));
  if (!task) {
    throw new Error("Failed to create task");
  }

  return task;
}

/**
 * Get task by ID
 */
export function getTask(id: number): Task | undefined {
  return queryOne<Task>("SELECT * FROM tasks WHERE id = ?", [id]);
}

/**
 * Get all tasks with optional filtering
 */
export function getAllTasks(filter?: TaskFilter): Task[] {
  let sql = "SELECT * FROM tasks WHERE 1=1";
  const params: unknown[] = [];

  if (filter?.completed !== undefined) {
    sql += " AND completed = ?";
    params.push(filter.completed ? 1 : 0);
  }

  if (filter?.priority) {
    sql += " AND priority = ?";
    params.push(filter.priority);
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
 * Get tasks due today or overdue
 */
export function getUpcomingTasks(): Task[] {
  const today = new Date().toISOString().split("T")[0];
  return query<Task>(
    `SELECT * FROM tasks
     WHERE completed = 0
     AND due_date IS NOT NULL
     AND due_date <= ?
     ORDER BY due_date ASC`,
    [today]
  );
}

/**
 * Update task
 */
export function updateTask(
  id: number,
  updates: Partial<Pick<Task, "title" | "completed" | "due_date" | "priority">>
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

  if (fields.length === 0) {
    return false;
  }

  params.push(id);
  const sql = `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`;
  const result = execute(sql, params);

  return result.changes > 0;
}

/**
 * Toggle task completion status
 */
export function toggleTaskComplete(id: number): boolean {
  const task = getTask(id);
  if (!task) {
    return false;
  }

  return updateTask(id, { completed: !task.completed });
}

/**
 * Delete task
 */
export function deleteTask(id: number): boolean {
  const result = execute("DELETE FROM tasks WHERE id = ?", [id]);
  return result.changes > 0;
}

/**
 * Delete all completed tasks
 */
export function deleteCompletedTasks(): number {
  const result = execute("DELETE FROM tasks WHERE completed = 1");
  return result.changes;
}

/**
 * Get task statistics
 */
export function getTaskStatistics(): {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  byPriority: Record<TaskPriority, number>;
} {
  const tasks = getAllTasks();
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
