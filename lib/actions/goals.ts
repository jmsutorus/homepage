"use server";

import { auth } from "@/auth";
import {
  getGoals,
  getGoalById,
  getGoalBySlug,
  getGoalWithDetails,
  getGoalsWithProgress,
  createGoal,
  updateGoal,
  deleteGoal,
  getMilestonesByGoalId,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  reorderMilestones,
  getChecklistByGoalId,
  getChecklistByMilestoneId,
  createGoalChecklistItem,
  createMilestoneChecklistItem,
  updateChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  reorderGoalChecklist,
  reorderMilestoneChecklist,
  getAllGoalTags,
  getGoalLinks,
  addGoalLink,
  removeGoalLink,
  replaceGoalLinks,
  type Goal,
  type GoalStatus,
  type GoalPriority,
  type GoalMilestone,
  type GoalChecklistItem,
  type GoalWithDetails,
  type GoalLink,
  type GoalLinkType,
} from "@/lib/db/goals";
import { revalidatePath } from "next/cache";

// ============================================================================
// Goal Actions
// ============================================================================

export async function getGoalsAction(options?: {
  status?: GoalStatus | GoalStatus[];
  priority?: GoalPriority;
  includeArchived?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getGoals(session.user.id, options);
}

export async function getGoalsWithProgressAction(options?: {
  status?: GoalStatus | GoalStatus[];
  priority?: GoalPriority;
  includeArchived?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getGoalsWithProgress(session.user.id, options);
}

export async function getGoalByIdAction(id: number) {
  const session = await auth();
  if (!session?.user?.id) return null;
  return getGoalById(id, session.user.id);
}

export async function getGoalBySlugAction(slug: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  return getGoalBySlug(slug, session.user.id);
}

export async function getGoalWithDetailsAction(slug: string): Promise<GoalWithDetails | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return getGoalWithDetails(slug, session.user.id);
}

export async function createGoalAction(data: {
  title: string;
  description?: string;
  content?: string;
  status?: GoalStatus;
  target_date?: string;
  tags?: string[];
  priority?: GoalPriority;
}): Promise<Goal> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const goal = createGoal(session.user.id, data);
  revalidatePath("/goals");
  return goal;
}

export async function updateGoalAction(id: number, data: {
  title?: string;
  description?: string;
  content?: string;
  status?: GoalStatus;
  target_date?: string | null;
  completed_date?: string | null;
  tags?: string[];
  priority?: GoalPriority;
}): Promise<Goal> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const goal = updateGoal(id, session.user.id, data);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return goal;
}

export async function deleteGoalAction(id: number): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const success = deleteGoal(id, session.user.id);
  revalidatePath("/goals");
  return success;
}

export async function getAllGoalTagsAction(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getAllGoalTags(session.user.id);
}

// ============================================================================
// Milestone Actions
// ============================================================================

export async function getMilestonesAction(goalId: number): Promise<GoalMilestone[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) return [];

  return getMilestonesByGoalId(goalId);
}

export async function createMilestoneAction(goalId: number, data: {
  title: string;
  description?: string;
  target_date?: string;
}): Promise<GoalMilestone> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const milestone = createMilestone(goalId, data);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return milestone;
}

export async function updateMilestoneAction(id: number, goalId: number, data: {
  title?: string;
  description?: string;
  target_date?: string | null;
  completed?: boolean;
}): Promise<GoalMilestone> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const milestone = updateMilestone(id, data);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return milestone;
}

export async function toggleMilestoneAction(id: number, goalId: number): Promise<GoalMilestone> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const current = getMilestoneById(id);
  if (!current) throw new Error("Milestone not found");

  const milestone = updateMilestone(id, { completed: !current.completed });
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return milestone;
}

export async function deleteMilestoneAction(id: number, goalId: number): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const success = deleteMilestone(id);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return success;
}

export async function reorderMilestonesAction(goalId: number, milestoneIds: number[]): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const success = reorderMilestones(goalId, milestoneIds);
  revalidatePath(`/goals/${goal.slug}`);
  return success;
}

// ============================================================================
// Checklist Actions
// ============================================================================

export async function getGoalChecklistAction(goalId: number): Promise<GoalChecklistItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) return [];

  return getChecklistByGoalId(goalId);
}

export async function getMilestoneChecklistAction(milestoneId: number, goalId: number): Promise<GoalChecklistItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) return [];

  return getChecklistByMilestoneId(milestoneId);
}

export async function createGoalChecklistItemAction(goalId: number, data: {
  text: string;
}): Promise<GoalChecklistItem> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const item = createGoalChecklistItem(goalId, data);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return item;
}

export async function createMilestoneChecklistItemAction(milestoneId: number, goalId: number, data: {
  text: string;
}): Promise<GoalChecklistItem> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const item = createMilestoneChecklistItem(milestoneId, data);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return item;
}

export async function updateChecklistItemAction(id: number, goalId: number, data: {
  text?: string;
  completed?: boolean;
}): Promise<GoalChecklistItem> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const item = updateChecklistItem(id, data);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return item;
}

export async function toggleChecklistItemAction(id: number, goalId: number): Promise<GoalChecklistItem> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const item = toggleChecklistItem(id);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return item;
}

export async function deleteChecklistItemAction(id: number, goalId: number): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const success = deleteChecklistItem(id);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return success;
}

export async function reorderGoalChecklistAction(goalId: number, itemIds: number[]): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const success = reorderGoalChecklist(goalId, itemIds);
  revalidatePath(`/goals/${goal.slug}`);
  return success;
}

export async function reorderMilestoneChecklistAction(milestoneId: number, goalId: number, itemIds: number[]): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const success = reorderMilestoneChecklist(milestoneId, itemIds);
  revalidatePath(`/goals/${goal.slug}`);
  return success;
}

// ============================================================================
// Goal Links Actions
// ============================================================================

export async function getGoalLinksAction(goalId: number): Promise<GoalLink[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) return [];

  return getGoalLinks(goalId);
}

export async function addGoalLinkAction(
  goalId: number,
  linkedType: GoalLinkType,
  linkedId: number,
  linkedSlug?: string,
  note?: string
): Promise<GoalLink> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const link = addGoalLink(session.user.id, goalId, linkedType, linkedId, linkedSlug, note);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return link;
}

export async function removeGoalLinkAction(linkId: number, goalId: number): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const success = removeGoalLink(linkId);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return success;
}

export async function replaceGoalLinksAction(
  goalId: number,
  links: Array<{
    linked_type: GoalLinkType;
    linked_id: number;
    linked_slug?: string;
    note?: string;
  }>
): Promise<GoalLink[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify user owns the goal
  const goal = getGoalById(goalId, session.user.id);
  if (!goal) throw new Error("Goal not found");

  const newLinks = replaceGoalLinks(session.user.id, goalId, links);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.slug}`);
  return newLinks;
}
