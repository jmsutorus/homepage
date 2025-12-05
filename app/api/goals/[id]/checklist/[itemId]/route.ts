import { NextRequest, NextResponse } from "next/server";
import { getUserId, requireAuthApi } from "@/lib/auth/server";
import {
  getGoalById,
  updateChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from "@/lib/db/goals";

interface RouteContext {
  params: Promise<{ id: string; itemId: string }>;
}

/**
 * PATCH /api/goals/[id]/checklist/[itemId]
 * Body: { text?, completed?, toggle? }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id, itemId } = await context.params;
    const goalId = parseInt(id, 10);
    const checklistItemId = parseInt(itemId, 10);

    if (isNaN(goalId) || isNaN(checklistItemId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Verify user owns the goal
    const goal = getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();

    // Handle toggle
    if (body.toggle === true) {
      const item = toggleChecklistItem(checklistItemId);
      return NextResponse.json(item);
    }

    // Handle update
    const updates: { text?: string; completed?: boolean } = {};

    if (body.text !== undefined) {
      updates.text = body.text;
    }
    if (body.completed !== undefined) {
      updates.completed = body.completed;
    }

    const item = updateChecklistItem(checklistItemId, updates);
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/goals/[id]/checklist/[itemId]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id, itemId } = await context.params;
    const goalId = parseInt(id, 10);
    const checklistItemId = parseInt(itemId, 10);

    if (isNaN(goalId) || isNaN(checklistItemId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Verify user owns the goal
    const goal = getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const success = deleteChecklistItem(checklistItemId);

    if (!success) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return NextResponse.json(
      { error: "Failed to delete checklist item" },
      { status: 500 }
    );
  }
}
