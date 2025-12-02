import { query, queryOne, execute } from "@/lib/db";
import type { TaskPriority } from "@/lib/db/tasks";

export interface TaskTemplate {
  id: number;
  userId: string;
  name: string;
  title: string;
  priority: TaskPriority;
  category: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskTemplateInput {
  name: string;
  title: string;
  priority: TaskPriority;
  category?: string;
  dueDate?: string;
}

export interface UpdateTaskTemplateInput {
  name?: string;
  title?: string;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
}

/**
 * Get all task templates for a user
 */
export async function getTaskTemplates(userId: string): Promise<TaskTemplate[]> {
  try {
    const templates = await query<TaskTemplate>(
      `SELECT
        id,
        userId,
        name,
        title,
        priority,
        category,
        dueDate,
        created_at as createdAt,
        updated_at as updatedAt
      FROM task_templates
      WHERE userId = ?
      ORDER BY name ASC`,
      [userId]
    );
    return templates;
  } catch (error) {
    console.error("Error getting task templates:", error);
    return [];
  }
}

/**
 * Get a single task template by ID
 */
export async function getTaskTemplate(id: number, userId: string): Promise<TaskTemplate | null> {
  try {
    const template = await queryOne<TaskTemplate>(
      `SELECT
        id,
        userId,
        name,
        title,
        priority,
        category,
        dueDate,
        created_at as createdAt,
        updated_at as updatedAt
      FROM task_templates
      WHERE id = ? AND userId = ?`,
      [id, userId]
    );
    return template || null;
  } catch (error) {
    console.error("Error getting task template:", error);
    return null;
  }
}

/**
 * Create a new task template
 */
export async function createTaskTemplate(
  userId: string,
  input: CreateTaskTemplateInput
): Promise<number> {
  const now = new Date().toISOString();

  const result = await execute(
    `INSERT INTO task_templates (userId, name, title, priority, category, dueDate, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.name,
      input.title,
      input.priority,
      input.category || null,
      input.dueDate || null,
      now,
      now,
    ]
  );

  return result.lastInsertRowid as number;
}

/**
 * Update a task template
 */
export async function updateTaskTemplate(
  id: number,
  userId: string,
  input: UpdateTaskTemplateInput
): Promise<boolean> {
  const now = new Date().toISOString();
  const updates: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }
  if (input.title !== undefined) {
    updates.push("title = ?");
    values.push(input.title);
  }
  if (input.priority !== undefined) {
    updates.push("priority = ?");
    values.push(input.priority);
  }
  if (input.category !== undefined) {
    updates.push("category = ?");
    values.push(input.category || null);
  }
  if (input.dueDate !== undefined) {
    updates.push("dueDate = ?");
    values.push(input.dueDate || null);
  }

  if (updates.length === 0) return false;

  updates.push("updated_at = ?");
  values.push(now);
  values.push(id);
  values.push(userId);

  const result = await execute(
    `UPDATE task_templates
     SET ${updates.join(", ")}
     WHERE id = ? AND userId = ?`,
    values
  );

  return result.changes > 0;
}

/**
 * Delete a task template
 */
export async function deleteTaskTemplate(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM task_templates WHERE id = ? AND userId = ?",
    [id, userId]
  );

  return result.changes > 0;
}
