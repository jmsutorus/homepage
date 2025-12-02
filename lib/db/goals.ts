import { query, queryOne, execute } from "@/lib/db";

// ============================================================================
// Type Definitions
// ============================================================================

export type GoalStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'archived' | 'abandoned';
export type GoalPriority = 'low' | 'medium' | 'high';

export interface Goal {
  id: number;
  userId: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  status: GoalStatus;
  target_date: string | null;
  completed_date: string | null;
  tags: string[];
  priority: GoalPriority;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: number;
  goalId: number;
  title: string;
  description: string | null;
  target_date: string | null;
  completed: boolean;
  completed_date: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface GoalChecklistItem {
  id: number;
  goalId: number | null;
  milestoneId: number | null;
  text: string;
  completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Extended type with all related data
export interface GoalWithDetails extends Goal {
  milestones: GoalMilestoneWithChecklist[];
  checklist: GoalChecklistItem[];
  progress: number;
}

export interface GoalMilestoneWithChecklist extends GoalMilestone {
  checklist: GoalChecklistItem[];
}

// Raw database row types (before parsing)
interface GoalRow {
  id: number;
  userId: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  status: GoalStatus;
  target_date: string | null;
  completed_date: string | null;
  tags: string | null;
  priority: GoalPriority;
  created_at: string;
  updated_at: string;
}

interface MilestoneRow {
  id: number;
  goalId: number;
  title: string;
  description: string | null;
  target_date: string | null;
  completed: number;
  completed_date: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface ChecklistRow {
  id: number;
  goalId: number | null;
  milestoneId: number | null;
  text: string;
  completed: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseGoalRow(row: GoalRow): Goal {
  return {
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : [],
  };
}

function parseMilestoneRow(row: MilestoneRow): GoalMilestone {
  return {
    ...row,
    completed: row.completed === 1,
  };
}

function parseChecklistRow(row: ChecklistRow): GoalChecklistItem {
  return {
    ...row,
    completed: row.completed === 1,
  };
}

/**
 * Generate a URL-friendly slug from a title
 */
export async function generateSlug(title: string): Promise<string> {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

/**
 * Ensure slug is unique for a user
 */
async function ensureUniqueSlug(userId: string, baseSlug: string, excludeId?: number): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await queryOne<{ id: number }>(
      excludeId
        ? "SELECT id FROM goals WHERE userId = ? AND slug = ? AND id != ?"
        : "SELECT id FROM goals WHERE userId = ? AND slug = ?",
      excludeId ? [userId, slug, excludeId] : [userId, slug]
    );

    if (!existing) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Calculate goal progress based on milestones and checklists
 */
export function calculateGoalProgress(
  milestones: GoalMilestone[],
  goalChecklist: GoalChecklistItem[],
  milestoneChecklists: Map<number, GoalChecklistItem[]>
): number {
  // If no milestones and no checklist, return 0
  if (milestones.length === 0 && goalChecklist.length === 0) {
    return 0;
  }

  // Goal checklist progress
  const goalChecklistProgress = goalChecklist.length > 0
    ? goalChecklist.filter(c => c.completed).length / goalChecklist.length
    : 1;

  // If no milestones, just use goal checklist
  if (milestones.length === 0) {
    return Math.round(goalChecklistProgress * 100);
  }

  // Calculate milestone progress (including their checklists)
  let milestoneProgress = 0;
  milestones.forEach(milestone => {
    const milestoneChecklist = milestoneChecklists.get(milestone.id) || [];

    if (milestone.completed) {
      milestoneProgress += 1;
    } else if (milestoneChecklist.length > 0) {
      // Partial progress based on checklist completion
      const checklistDone = milestoneChecklist.filter(c => c.completed).length;
      milestoneProgress += checklistDone / milestoneChecklist.length;
    }
  });

  const milestoneProgressPercent = milestoneProgress / milestones.length;

  // Weight: 70% milestones, 30% goal checklist
  const totalProgress = (milestoneProgressPercent * 0.7) + (goalChecklistProgress * 0.3);
  return Math.round(totalProgress * 100);
}

// ============================================================================
// Goal CRUD Operations
// ============================================================================

/**
 * Get all goals for a user
 */
export async function getGoals(userId: string, options?: {
  status?: GoalStatus | GoalStatus[];
  priority?: GoalPriority;
  includeArchived?: boolean;
}): Promise<Goal[]> {
  try {
    let sql = "SELECT * FROM goals WHERE userId = ?";
    const params: (string | number | null)[] = [userId];

    if (options?.status) {
      if (Array.isArray(options.status)) {
        sql += ` AND status IN (${options.status.map(() => '?').join(',')})`;
        params.push(...options.status);
      } else {
        sql += " AND status = ?";
        params.push(options.status);
      }
    } else if (!options?.includeArchived) {
      // By default, exclude archived and abandoned
      sql += " AND status NOT IN ('archived', 'abandoned')";
    }

    if (options?.priority) {
      sql += " AND priority = ?";
      params.push(options.priority);
    }

    sql += " ORDER BY CASE status WHEN 'in_progress' THEN 1 WHEN 'not_started' THEN 2 WHEN 'on_hold' THEN 3 ELSE 4 END, target_date ASC, created_at DESC";

    const rows = await query<GoalRow>(sql, params);
    return rows.map(parseGoalRow);
  } catch (error) {
    console.error("Error getting goals:", error);
    return [];
  }
}

/**
 * Get a single goal by ID
 */
export async function getGoalById(id: number, userId: string): Promise<Goal | null> {
  try {
    const row = await queryOne<GoalRow>(
      "SELECT * FROM goals WHERE id = ? AND userId = ?",
      [id, userId]
    );
    return row ? parseGoalRow(row) : null;
  } catch (error) {
    console.error("Error getting goal by ID:", error);
    return null;
  }
}

/**
 * Get a single goal by slug
 */
export async function getGoalBySlug(slug: string, userId: string): Promise<Goal | null> {
  try {
    const row = await queryOne<GoalRow>(
      "SELECT * FROM goals WHERE slug = ? AND userId = ?",
      [slug, userId]
    );
    return row ? parseGoalRow(row) : null;
  } catch (error) {
    console.error("Error getting goal by slug:", error);
    return null;
  }
}

/**
 * Get a goal with all its related data (milestones, checklists, progress)
 */
export async function getGoalWithDetails(slug: string, userId: string): Promise<GoalWithDetails | null> {
  try {
    const goal = await getGoalBySlug(slug, userId);
    if (!goal) return null;

    const milestones = await getMilestonesByGoalId(goal.id);
    const goalChecklist = await getChecklistByGoalId(goal.id);

    // Get checklists for each milestone
    const milestoneChecklists = new Map<number, GoalChecklistItem[]>();
    const milestonesWithChecklist: GoalMilestoneWithChecklist[] = await Promise.all(milestones.map(async milestone => {
      const checklist = await getChecklistByMilestoneId(milestone.id);
      milestoneChecklists.set(milestone.id, checklist);
      return { ...milestone, checklist };
    }));

    const progress = calculateGoalProgress(milestones, goalChecklist, milestoneChecklists);

    return {
      ...goal,
      milestones: milestonesWithChecklist,
      checklist: goalChecklist,
      progress,
    };
  } catch (error) {
    console.error("Error getting goal with details:", error);
    return null;
  }
}

/**
 * Create a new goal
 */
export async function createGoal(userId: string, data: {
  title: string;
  description?: string;
  content?: string;
  status?: GoalStatus;
  target_date?: string;
  tags?: string[];
  priority?: GoalPriority;
}): Promise<Goal> {
  try {
    const baseSlug = await generateSlug(data.title);
    const slug = await ensureUniqueSlug(userId, baseSlug);

    const result = await execute(
      `INSERT INTO goals (userId, slug, title, description, content, status, target_date, tags, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        slug,
        data.title,
        data.description || null,
        data.content || null,
        data.status || 'not_started',
        data.target_date || null,
        data.tags ? JSON.stringify(data.tags) : null,
        data.priority || 'medium',
      ]
    );

    const goal = await queryOne<GoalRow>("SELECT * FROM goals WHERE id = ?", [result.lastInsertRowid]);
    if (!goal) throw new Error("Failed to create goal");
    return parseGoalRow(goal);
  } catch (error) {
    console.error("Error creating goal:", error);
    throw error;
  }
}

/**
 * Update a goal
 */
export async function updateGoal(id: number, userId: string, data: {
  title?: string;
  description?: string;
  content?: string;
  status?: GoalStatus;
  target_date?: string | null;
  completed_date?: string | null;
  tags?: string[];
  priority?: GoalPriority;
}): Promise<Goal> {
  try {
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);

      // Update slug if title changed
      const baseSlug = await generateSlug(data.title);
      const slug = await ensureUniqueSlug(userId, baseSlug, id);
      updates.push("slug = ?");
      values.push(slug);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.content !== undefined) {
      updates.push("content = ?");
      values.push(data.content);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      values.push(data.status);

      // Auto-set completed_date when marking as completed
      if (data.status === 'completed' && data.completed_date === undefined) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        updates.push("completed_date = ?");
        values.push(dateStr);
      }
    }
    if (data.target_date !== undefined) {
      updates.push("target_date = ?");
      values.push(data.target_date);
    }
    if (data.completed_date !== undefined) {
      updates.push("completed_date = ?");
      values.push(data.completed_date);
    }
    if (data.tags !== undefined) {
      updates.push("tags = ?");
      values.push(JSON.stringify(data.tags));
    }
    if (data.priority !== undefined) {
      updates.push("priority = ?");
      values.push(data.priority);
    }

    if (updates.length === 0) throw new Error("No updates provided");

    values.push(id);
    values.push(userId);

    await execute(
      `UPDATE goals SET ${updates.join(", ")} WHERE id = ? AND userId = ?`,
      values
    );

    const goal = await queryOne<GoalRow>("SELECT * FROM goals WHERE id = ?", [id]);
    if (!goal) throw new Error("Goal not found");
    return parseGoalRow(goal);
  } catch (error) {
    console.error("Error updating goal:", error);
    throw error;
  }
}

/**
 * Delete a goal (cascades to milestones and checklists)
 */
export async function deleteGoal(id: number, userId: string): Promise<boolean> {
  try {
    const result = await execute("DELETE FROM goals WHERE id = ? AND userId = ?", [id, userId]);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting goal:", error);
    return false;
  }
}

// ============================================================================
// Milestone CRUD Operations
// ============================================================================

/**
 * Get all milestones for a goal
 */
export async function getMilestonesByGoalId(goalId: number): Promise<GoalMilestone[]> {
  try {
    const rows = await query<MilestoneRow>(
      "SELECT * FROM goal_milestones WHERE goalId = ? ORDER BY order_index ASC, created_at ASC",
      [goalId]
    );
    return rows.map(parseMilestoneRow);
  } catch (error) {
    console.error("Error getting milestones:", error);
    return [];
  }
}

/**
 * Get a single milestone by ID
 */
export async function getMilestoneById(id: number): Promise<GoalMilestone | null> {
  try {
    const row = await queryOne<MilestoneRow>(
      "SELECT * FROM goal_milestones WHERE id = ?",
      [id]
    );
    return row ? parseMilestoneRow(row) : null;
  } catch (error) {
    console.error("Error getting milestone:", error);
    return null;
  }
}

/**
 * Create a new milestone
 */
export async function createMilestone(goalId: number, data: {
  title: string;
  description?: string;
  target_date?: string;
  order_index?: number;
}): Promise<GoalMilestone> {
  try {
    // Get max order_index for this goal
    const maxOrder = await queryOne<{ max_order: number | null }>(
      "SELECT MAX(order_index) as max_order FROM goal_milestones WHERE goalId = ?",
      [goalId]
    );
    const orderIndex = data.order_index ?? ((maxOrder?.max_order ?? -1) + 1);

    const result = await execute(
      `INSERT INTO goal_milestones (goalId, title, description, target_date, order_index)
       VALUES (?, ?, ?, ?, ?)`,
      [
        goalId,
        data.title,
        data.description || null,
        data.target_date || null,
        orderIndex,
      ]
    );

    const milestone = await queryOne<MilestoneRow>(
      "SELECT * FROM goal_milestones WHERE id = ?",
      [result.lastInsertRowid]
    );
    if (!milestone) throw new Error("Failed to create milestone");
    return parseMilestoneRow(milestone);
  } catch (error) {
    console.error("Error creating milestone:", error);
    throw error;
  }
}

/**
 * Update a milestone
 */
export async function updateMilestone(id: number, data: {
  title?: string;
  description?: string;
  target_date?: string | null;
  completed?: boolean;
  completed_date?: string | null;
  order_index?: number;
}): Promise<GoalMilestone> {
  try {
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.target_date !== undefined) {
      updates.push("target_date = ?");
      values.push(data.target_date);
    }
    if (data.completed !== undefined) {
      updates.push("completed = ?");
      values.push(data.completed ? 1 : 0);

      // Auto-set completed_date
      if (data.completed && data.completed_date === undefined) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        updates.push("completed_date = ?");
        values.push(dateStr);
      } else if (!data.completed) {
        updates.push("completed_date = ?");
        values.push(null);
      }
    }
    if (data.completed_date !== undefined) {
      updates.push("completed_date = ?");
      values.push(data.completed_date);
    }
    if (data.order_index !== undefined) {
      updates.push("order_index = ?");
      values.push(data.order_index);
    }

    if (updates.length === 0) throw new Error("No updates provided");

    values.push(id);

    await execute(
      `UPDATE goal_milestones SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const milestone = await queryOne<MilestoneRow>(
      "SELECT * FROM goal_milestones WHERE id = ?",
      [id]
    );
    if (!milestone) throw new Error("Milestone not found");
    return parseMilestoneRow(milestone);
  } catch (error) {
    console.error("Error updating milestone:", error);
    throw error;
  }
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(id: number): Promise<boolean> {
  try {
    const result = await execute("DELETE FROM goal_milestones WHERE id = ?", [id]);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return false;
  }
}

/**
 * Reorder milestones
 */
export async function reorderMilestones(goalId: number, milestoneIds: number[]): Promise<boolean> {
  try {
    milestoneIds.forEach(async (id, index) => {
      await execute(
        "UPDATE goal_milestones SET order_index = ? WHERE id = ? AND goalId = ?",
        [index, id, goalId]
      );
    });
    return true;
  } catch (error) {
    console.error("Error reordering milestones:", error);
    return false;
  }
}

// ============================================================================
// Checklist Item CRUD Operations
// ============================================================================

/**
 * Get checklist items for a goal
 */
export async function getChecklistByGoalId(goalId: number): Promise<GoalChecklistItem[]> {
  try {
    const rows = await query<ChecklistRow>(
      "SELECT * FROM goal_checklist_items WHERE goalId = ? AND milestoneId IS NULL ORDER BY order_index ASC",
      [goalId]
    );
    return rows.map(parseChecklistRow);
  } catch (error) {
    console.error("Error getting goal checklist:", error);
    return [];
  }
}

/**
 * Get checklist items for a milestone
 */
export async function getChecklistByMilestoneId(milestoneId: number): Promise<GoalChecklistItem[]> {
  try {
    const rows = await query<ChecklistRow>(
      "SELECT * FROM goal_checklist_items WHERE milestoneId = ? ORDER BY order_index ASC",
      [milestoneId]
    );
    return rows.map(parseChecklistRow);
  } catch (error) {
    console.error("Error getting milestone checklist:", error);
    return [];
  }
}

/**
 * Create a checklist item for a goal
 */
export async function createGoalChecklistItem(goalId: number, data: {
  text: string;
  order_index?: number;
}): Promise<GoalChecklistItem> {
  try {
    const maxOrder = await queryOne<{ max_order: number | null }>(
      "SELECT MAX(order_index) as max_order FROM goal_checklist_items WHERE goalId = ? AND milestoneId IS NULL",
      [goalId]
    );
    const orderIndex = data.order_index ?? ((maxOrder?.max_order ?? -1) + 1);

    const result = await execute(
      `INSERT INTO goal_checklist_items (goalId, milestoneId, text, order_index)
       VALUES (?, NULL, ?, ?)`,
      [goalId, data.text, orderIndex]
    );

    const item = await queryOne<ChecklistRow>(
      "SELECT * FROM goal_checklist_items WHERE id = ?",
      [result.lastInsertRowid]
    );
    if (!item) throw new Error("Failed to create checklist item");
    return parseChecklistRow(item);
  } catch (error) {
    console.error("Error creating goal checklist item:", error);
    throw error;
  }
}

/**
 * Create a checklist item for a milestone
 */
export async function createMilestoneChecklistItem(milestoneId: number, data: {
  text: string;
  order_index?: number;
}): Promise<GoalChecklistItem> {
  try {
    const maxOrder = await queryOne<{ max_order: number | null }>(
      "SELECT MAX(order_index) as max_order FROM goal_checklist_items WHERE milestoneId = ?",
      [milestoneId]
    );
    const orderIndex = data.order_index ?? ((maxOrder?.max_order ?? -1) + 1);

    const result = await execute(
      `INSERT INTO goal_checklist_items (goalId, milestoneId, text, order_index)
       VALUES (NULL, ?, ?, ?)`,
      [milestoneId, data.text, orderIndex]
    );

    const item = await queryOne<ChecklistRow>(
      "SELECT * FROM goal_checklist_items WHERE id = ?",
      [result.lastInsertRowid]
    );
    if (!item) throw new Error("Failed to create checklist item");
    return parseChecklistRow(item);
  } catch (error) {
    console.error("Error creating milestone checklist item:", error);
    throw error;
  }
}

/**
 * Update a checklist item
 */
export async function updateChecklistItem(id: number, data: {
  text?: string;
  completed?: boolean;
  order_index?: number;
}): Promise<GoalChecklistItem> {
  try {
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.text !== undefined) {
      updates.push("text = ?");
      values.push(data.text);
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

    await execute(
      `UPDATE goal_checklist_items SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const item = await queryOne<ChecklistRow>(
      "SELECT * FROM goal_checklist_items WHERE id = ?",
      [id]
    );
    if (!item) throw new Error("Checklist item not found");
    return parseChecklistRow(item);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    throw error;
  }
}

/**
 * Toggle checklist item completion
 */
export async function toggleChecklistItem(id: number): Promise<GoalChecklistItem> {
  try {
    const current = await queryOne<ChecklistRow>(
      "SELECT * FROM goal_checklist_items WHERE id = ?",
      [id]
    );
    if (!current) throw new Error("Checklist item not found");

    return updateChecklistItem(id, { completed: current.completed !== 1 });
  } catch (error) {
    console.error("Error toggling checklist item:", error);
    throw error;
  }
}

/**
 * Delete a checklist item
 */
export async function deleteChecklistItem(id: number): Promise<boolean> {
  try {
    const result = await execute("DELETE FROM goal_checklist_items WHERE id = ?", [id]);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return false;
  }
}

/**
 * Reorder checklist items for a goal
 */
export async function reorderGoalChecklist(goalId: number, itemIds: number[]): Promise<boolean> {
  try {
    itemIds.forEach(async (id, index) => {
      await execute(
        "UPDATE goal_checklist_items SET order_index = ? WHERE id = ? AND goalId = ? AND milestoneId IS NULL",
        [index, id, goalId]
      );
    });
    return true;
  } catch (error) {
    console.error("Error reordering goal checklist:", error);
    return false;
  }
}

/**
 * Reorder checklist items for a milestone
 */
export async function reorderMilestoneChecklist(milestoneId: number, itemIds: number[]): Promise<boolean> {
  try {
    itemIds.forEach(async (id, index) => {
      await execute(
        "UPDATE goal_checklist_items SET order_index = ? WHERE id = ? AND milestoneId = ?",
        [index, id, milestoneId]
      );
    });
    return true;
  } catch (error) {
    console.error("Error reordering milestone checklist:", error);
    return false;
  }
}

// ============================================================================
// Aggregate Functions
// ============================================================================

/**
 * Get goals with progress for list view
 */
export async function getGoalsWithProgress(userId: string, options?: {
  status?: GoalStatus | GoalStatus[];
  priority?: GoalPriority;
  includeArchived?: boolean;
}): Promise<(Goal & { progress: number; milestoneCount: number; milestonesCompleted: number })[]> {
  try {
    const goals = await getGoals(userId, options);

    const goalsWithProgress = await Promise.all(goals.map(async goal => {
      const milestones = await getMilestonesByGoalId(goal.id);
      const goalChecklist = await getChecklistByGoalId(goal.id);

      const milestoneChecklists = new Map<number, GoalChecklistItem[]>();
      await Promise.all(milestones.map(async milestone => {
        const checklist = await getChecklistByMilestoneId(milestone.id);
        milestoneChecklists.set(milestone.id, checklist);
      }));

      const progress = calculateGoalProgress(milestones, goalChecklist, milestoneChecklists);

      return {
        ...goal,
        progress,
        milestoneCount: milestones.length,
        milestonesCompleted: milestones.filter(m => m.completed).length,
      };
    }));

    return goalsWithProgress;
  } catch (error) {
    console.error("Error getting goals with progress:", error);
    return [];
  }
}

/**
 * Get all unique tags from goals
 */
export async function getAllGoalTags(userId: string): Promise<string[]> {
  try {
    const goals = await query<{ tags: string | null }>(
      "SELECT tags FROM goals WHERE userId = ?",
      [userId]
    );

    const tagSet = new Set<string>();
    goals.forEach(goal => {
      if (goal.tags) {
        const tags = JSON.parse(goal.tags) as string[];
        tags.forEach(tag => tagSet.add(tag));
      }
    });

    return Array.from(tagSet).sort();
  } catch (error) {
    console.error("Error getting goal tags:", error);
    return [];
  }
}

// ============================================================================
// Goal Links
// ============================================================================

export type GoalLinkType = 'habit' | 'task' | 'journal';

export interface GoalLink {
  id: number;
  userId: string;
  goalId: number;
  linked_type: GoalLinkType;
  linked_id: number;
  linked_slug: string | null;
  note: string | null;
  created_at: string;
}

interface GoalLinkRow {
  id: number;
  userId: string;
  goalId: number;
  linked_type: string;
  linked_id: number;
  linked_slug: string | null;
  note: string | null;
  created_at: string;
}

function parseGoalLinkRow(row: GoalLinkRow): GoalLink {
  return {
    ...row,
    linked_type: row.linked_type as GoalLinkType,
  };
}

/**
 * Get all links for a goal
 */
export async function getGoalLinks(goalId: number): Promise<GoalLink[]> {
  try {
    const rows = await query<GoalLinkRow>(
      "SELECT * FROM goal_links WHERE goalId = ? ORDER BY created_at DESC",
      [goalId]
    );
    return rows.map(parseGoalLinkRow);
  } catch (error) {
    console.error("Error getting goal links:", error);
    return [];
  }
}

/**
 * Get links for a goal filtered by type
 */
export async function getGoalLinksByType(goalId: number, linkedType: GoalLinkType): Promise<GoalLink[]> {
  try {
    const rows = await query<GoalLinkRow>(
      "SELECT * FROM goal_links WHERE goalId = ? AND linked_type = ? ORDER BY created_at DESC",
      [goalId, linkedType]
    );
    return rows.map(parseGoalLinkRow);
  } catch (error) {
    console.error("Error getting goal links by type:", error);
    return [];
  }
}

/**
 * Add a link to a goal
 */
export async function addGoalLink(
  userId: string,
  goalId: number,
  linkedType: GoalLinkType,
  linkedId: number,
  linkedSlug?: string,
  note?: string
): Promise<GoalLink> {
  try {
    const result = await execute(
      `INSERT INTO goal_links (userId, goalId, linked_type, linked_id, linked_slug, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, goalId, linkedType, linkedId, linkedSlug || null, note || null]
    );

    const link = await queryOne<GoalLinkRow>(
      "SELECT * FROM goal_links WHERE id = ?",
      [result.lastInsertRowid]
    );
    if (!link) throw new Error("Failed to create goal link");
    return parseGoalLinkRow(link);
  } catch (error) {
    console.error("Error adding goal link:", error);
    throw error;
  }
}

/**
 * Remove a link from a goal
 */
export async function removeGoalLink(id: number): Promise<boolean> {
  try {
    const result = await execute("DELETE FROM goal_links WHERE id = ?", [id]);
    return result.changes > 0;
  } catch (error) {
    console.error("Error removing goal link:", error);
    return false;
  }
}

/**
 * Remove a link by goal + type + linked ID
 */
export async function removeGoalLinkByObject(
  goalId: number,
  linkedType: GoalLinkType,
  linkedId: number
): Promise<boolean> {
  try {
    const result = await execute(
      "DELETE FROM goal_links WHERE goalId = ? AND linked_type = ? AND linked_id = ?",
      [goalId, linkedType, linkedId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error("Error removing goal link by object:", error);
    return false;
  }
}

/**
 * Update a goal link's note
 */
export async function updateGoalLinkNote(id: number, note: string | null): Promise<GoalLink> {
  try {
    await execute("UPDATE goal_links SET note = ? WHERE id = ?", [note, id]);
    const link = await queryOne<GoalLinkRow>("SELECT * FROM goal_links WHERE id = ?", [id]);
    if (!link) throw new Error("Goal link not found");
    return parseGoalLinkRow(link);
  } catch (error) {
    console.error("Error updating goal link note:", error);
    throw error;
  }
}

/**
 * Replace all links for a goal
 */
export async function replaceGoalLinks(
  userId: string,
  goalId: number,
  links: Array<{
    linked_type: GoalLinkType;
    linked_id: number;
    linked_slug?: string;
    note?: string;
  }>
): Promise<GoalLink[]> {
  try {
    // Delete existing links
    await execute("DELETE FROM goal_links WHERE goalId = ?", [goalId]);

    // Add new links
    const newLinks: GoalLink[] = [];
    for (const link of links) {
      const newLink = await addGoalLink(
        userId,
        goalId,
        link.linked_type,
        link.linked_id,
        link.linked_slug,
        link.note
      );
      newLinks.push(newLink);
    }

    return newLinks;
  } catch (error) {
    console.error("Error replacing goal links:", error);
    throw error;
  }
}

/**
 * Find all goals that link to a specific item
 */
export async function getGoalsLinkingTo(
  userId: string,
  linkedType: GoalLinkType,
  linkedId: number
): Promise<Goal[]> {
  try {
    const links = await query<{ goalId: number }>(
      "SELECT DISTINCT goalId FROM goal_links WHERE userId = ? AND linked_type = ? AND linked_id = ?",
      [userId, linkedType, linkedId]
    );

    const goals: Goal[] = [];
    for (const link of links) {
      const goal = await getGoalById(link.goalId, userId);
      if (goal) goals.push(goal);
    }

    return goals;
  } catch (error) {
    console.error("Error getting goals linking to item:", error);
    return [];
  }
}
