import { earthboundFetch } from "../api/earthbound";
import { queryOne, execute } from "./index";

// ============================================================================
// Type Definitions
// ============================================================================

import {
  type GoalStatus,
  type GoalPriority,
  type Goal,
  type GoalMilestone,
  type GoalChecklistItem,
  type GoalWithDetails,
  type GoalMilestoneWithChecklist,
  type GoalWithProgress,
} from "@jmsutorus/earthbound-shared";

export type {
  GoalStatus,
  GoalPriority,
  Goal,
  GoalMilestone,
  GoalChecklistItem,
  GoalWithDetails,
  GoalMilestoneWithChecklist,
  GoalWithProgress,
};

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
  const params = new URLSearchParams({ userId });
  if (options?.status) {
    if (Array.isArray(options.status)) {
      options.status.forEach(s => params.append('status', s));
    } else {
      params.append('status', options.status);
    }
  }
  if (options?.priority) params.append('priority', options.priority);
  if (options?.includeArchived) params.append('includeArchived', 'true');

  const response = await earthboundFetch(`/api/goals?${params.toString()}`);
  if (!response.ok) return [];
  return response.json() as Promise<Goal[]>;
}

/**
 * Get goals with their calculated progress
 */
export async function getGoalsWithProgress(userId: string, options?: {
  status?: GoalStatus | GoalStatus[];
  priority?: GoalPriority;
  includeArchived?: boolean;
}): Promise<GoalWithProgress[]> {
  const params = new URLSearchParams({ userId });
  if (options?.includeArchived) params.append('includeArchived', 'true');

  const response = await earthboundFetch(`/api/goals/progress?${params.toString()}`);
  if (!response.ok) return [];
  return response.json() as Promise<GoalWithProgress[]>;
}

/**
 * Get a single goal by ID
 */
export async function getGoalById(id: number, userId: string): Promise<Goal | null> {
  const response = await earthboundFetch(`/api/goals/id/${id}?userId=${userId}`);
  if (!response.ok) return null;
  return response.json() as Promise<Goal>;
}

/**
 * Get a single goal by slug
 */
export async function getGoalBySlug(slug: string, userId: string): Promise<Goal | null> {
  const response = await earthboundFetch(`/api/goals/s/${slug}?userId=${userId}`);
  if (!response.ok) return null;
  return response.json() as Promise<Goal>;
}

/**
 * Get a goal with all its related data (milestones, checklists, progress)
 */
export async function getGoalWithDetails(slug: string, userId: string): Promise<GoalWithDetails | null> {
  const response = await earthboundFetch(`/api/goals/s/${slug}/details?userId=${userId}`);
  if (!response.ok) return null;
  return response.json() as Promise<GoalWithDetails>;
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
  published?: boolean;
  featured?: boolean;
}): Promise<Goal> {
  const response = await earthboundFetch(`/api/goals`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`Failed to create goal: ${response.statusText}`);
  return response.json() as Promise<Goal>;
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
  published?: boolean;
  featured?: boolean;
}): Promise<Goal> {
  const response = await earthboundFetch(`/api/goals/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`Failed to update goal: ${response.statusText}`);
  return response.json() as Promise<Goal>;
}

/**
 * Delete a goal (cascades to milestones and checklists)
 */
export async function deleteGoal(id: number, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/goals/id/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// ============================================================================
// Milestone CRUD Operations
// ============================================================================

/**
 * Get all milestones for a goal
 */
export async function getMilestonesByGoalId(goalId: number): Promise<GoalMilestone[]> {
  const response = await earthboundFetch(`/api/goals/id/${goalId}/milestones`);
  if (!response.ok) return [];
  return response.json() as Promise<GoalMilestone[]>;
}

/**
 * Get a single milestone by ID
 */
export async function getMilestoneById(id: number): Promise<GoalMilestone | null> {
  const response = await earthboundFetch(`/api/goals/milestones/id/${id}`);
  if (!response.ok) return null;
  return response.json() as Promise<GoalMilestone>;
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
  const response = await earthboundFetch(`/api/goals/id/${goalId}/milestones`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`Failed to create milestone: ${response.statusText}`);
  return response.json() as Promise<GoalMilestone>;
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
  const response = await earthboundFetch(`/api/goals/milestones/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`Failed to update milestone: ${response.statusText}`);
  return response.json() as Promise<GoalMilestone>;
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(id: number): Promise<boolean> {
  const response = await earthboundFetch(`/api/goals/milestones/id/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Reorder milestones
 */
export async function reorderMilestones(goalId: number, milestoneIds: number[]): Promise<boolean> {
  const response = await earthboundFetch(`/api/goals/id/${goalId}/milestones/reorder`, {
    method: "POST",
    body: JSON.stringify({ milestoneIds }),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// ============================================================================
// Checklist Item CRUD Operations
// ============================================================================

/**
 * Create a checklist item for a goal
 */
export async function createGoalChecklistItem(goalId: number, data: {
  text: string;
  order_index?: number;
}): Promise<GoalChecklistItem> {
  const response = await earthboundFetch(`/api/goals/id/${goalId}/checklist`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`Failed to create checklist item: ${response.statusText}`);
  return response.json() as Promise<GoalChecklistItem>;
}

/**
 * Create a checklist item for a milestone
 */
export async function createMilestoneChecklistItem(milestoneId: number, data: {
  text: string;
  order_index?: number;
}): Promise<GoalChecklistItem> {
  const response = await earthboundFetch(`/api/goals/milestones/id/${milestoneId}/checklist`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`Failed to create checklist item: ${response.statusText}`);
  return response.json() as Promise<GoalChecklistItem>;
}

/**
 * Update a checklist item
 */
export async function updateChecklistItem(id: number, data: {
  text?: string;
  completed?: boolean;
  order_index?: number;
}): Promise<GoalChecklistItem> {
  const response = await earthboundFetch(`/api/goals/checklist/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`Failed to update checklist item: ${response.statusText}`);
  return response.json() as Promise<GoalChecklistItem>;
}

/**
 * Toggle checklist item completion
 */
export async function toggleChecklistItem(id: number): Promise<GoalChecklistItem> {
  const response = await earthboundFetch(`/api/goals/checklist/id/${id}/toggle`, {
    method: "POST",
  });

  if (!response.ok) throw new Error(`Failed to toggle checklist item: ${response.statusText}`);
  return response.json() as Promise<GoalChecklistItem>;
}

/**
 * Delete a checklist item
 */
export async function deleteChecklistItem(id: number): Promise<boolean> {
  const response = await earthboundFetch(`/api/goals/checklist/id/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Reorder checklist items for a goal
 */
export async function reorderGoalChecklist(goalId: number, itemIds: number[]): Promise<boolean> {
  const response = await earthboundFetch(`/api/goals/reorder-checklist`, {
    method: "POST",
    body: JSON.stringify({ goalId, itemIds }),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Reorder checklist items for a milestone
 */
export async function reorderMilestoneChecklist(milestoneId: number, itemIds: number[]): Promise<boolean> {
  const response = await earthboundFetch(`/api/goals/reorder-checklist`, {
    method: "POST",
    body: JSON.stringify({ milestoneId, itemIds }),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Get checklist items for a goal
 */
export async function getChecklistByGoalId(goalId: number): Promise<GoalChecklistItem[]> {
  const response = await earthboundFetch(`/api/goals/id/${goalId}/checklist`);
  if (!response.ok) return [];
  return response.json() as Promise<GoalChecklistItem[]>;
}

/**
 * Get checklist items for a milestone
 */
export async function getChecklistByMilestoneId(milestoneId: number): Promise<GoalChecklistItem[]> {
  const response = await earthboundFetch(`/api/goals/milestones/id/${milestoneId}/checklist`);
  if (!response.ok) return [];
  return response.json() as Promise<GoalChecklistItem[]>;
}

// These are still used locally in some UI components if they need them
export function calculateGoalProgress(
  milestones: GoalMilestone[],
  goalChecklist: GoalChecklistItem[],
  milestoneChecklists: Map<number, GoalChecklistItem[]>
): number {
  if (milestones.length === 0 && goalChecklist.length === 0) return 0;
  const goalChecklistProgress = goalChecklist.length > 0
    ? goalChecklist.filter(c => c.completed).length / goalChecklist.length
    : 1;
  if (milestones.length === 0) return Math.round(goalChecklistProgress * 100);
  let milestoneProgress = 0;
  milestones.forEach(milestone => {
    const milestoneChecklist = milestoneChecklists.get(milestone.id) || [];
    if (milestone.completed) milestoneProgress += 1;
    else if (milestoneChecklist.length > 0) {
      const checklistDone = milestoneChecklist.filter(c => c.completed).length;
      milestoneProgress += checklistDone / milestoneChecklist.length;
    }
  });
  const milestoneProgressPercent = milestoneProgress / milestones.length;
  const totalProgress = (milestoneProgressPercent * 0.7) + (goalChecklistProgress * 0.3);
  return Math.round(totalProgress * 100);
}

// ============================================================================
// Aggregate Functions
// ============================================================================

/**
 * Get all unique tags from goals
 */
export async function getAllGoalTags(userId: string): Promise<string[]> {
  const response = await earthboundFetch(`/api/goals/tags?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<string[]>;
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
  const response = await earthboundFetch(`/api/goals/id/${goalId}/links`);
  if (!response.ok) return [];
  return response.json() as Promise<GoalLink[]>;
}

/**
 * Get links for a goal filtered by type
 */
export async function getGoalLinksByType(goalId: number, linkedType: GoalLinkType): Promise<GoalLink[]> {
  const links = await getGoalLinks(goalId);
  return links.filter(l => l.linked_type === linkedType);
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
  const response = await earthboundFetch(`/api/goals/id/${goalId}/links`, {
    method: "POST",
    body: JSON.stringify({
      linked_type: linkedType,
      linked_id: linkedId,
      linked_slug: linkedSlug,
      note,
    }),
  });

  if (!response.ok) throw new Error(`Failed to add goal link: ${response.statusText}`);
  return response.json() as Promise<GoalLink>;
}

/**
 * Remove a link from a goal
 */
export async function removeGoalLink(id: number): Promise<boolean> {
  const response = await earthboundFetch(`/api/goals/links/id/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
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
  const response = await earthboundFetch(`/api/goals/id/${goalId}/links`, {
    method: "PUT",
    body: JSON.stringify(links),
  });

  if (!response.ok) throw new Error(`Failed to replace goal links: ${response.statusText}`);
  return response.json() as Promise<GoalLink[]>;
}

/**
 * Find all goals that link to a specific item
 */
export async function getGoalsLinkingTo(
  userId: string,
  linkedType: GoalLinkType,
  linkedId: number
): Promise<Goal[]> {
  // This is hard to do efficiently via API without a specific endpoint.
  // For now, return empty or implement a search endpoint if needed.
  return [];
}
