import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/server";
import {
  getGoalById,
  getMilestoneById,
  getChecklistByMilestoneId,
  createMilestoneChecklistItem,
  reorderMilestoneChecklist,
} from "@/lib/db/goals";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/milestones/[id]/checklist
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId();
    const { id } = await context.params;
    const milestoneId = parseInt(id, 10);

    if (isNaN(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
    }

    // Verify milestone exists
    const milestone = await getMilestoneById(milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Verify user owns the parent goal
    const goal = await getGoalById(milestone.goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const checklist = await getChecklistByMilestoneId(milestoneId);
    return NextResponse.json(checklist);
  } catch (error) {
    console.error("Error fetching milestone checklist:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/milestones/[id]/checklist
 * Body: { text } or { reorder: number[] }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId();
    const { id } = await context.params;
    const milestoneId = parseInt(id, 10);

    if (isNaN(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
    }

    // Verify milestone exists
    const milestone = await getMilestoneById(milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Verify user owns the parent goal
    const goal = await getGoalById(milestone.goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    // Handle reorder
    if (body.reorder && Array.isArray(body.reorder)) {
      const success = await reorderMilestoneChecklist(milestoneId, body.reorder);
      return NextResponse.json({ success });
    }

    // Handle create
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const item = await createMilestoneChecklistItem(milestoneId, { text: text.trim() });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone checklist item:", error);
    return NextResponse.json(
      { error: "Failed to create checklist item" },
      { status: 500 }
    );
  }
}
