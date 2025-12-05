import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getGoalById, removeGoalLink } from "@/lib/db/goals";
import { getUserId, requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ id: string; linkId: string }>;
}

/**
 * DELETE /api/goals/[id]/links/[linkId]
 * Remove a link from a goal
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id, linkId } = await params;
    const goalId = parseInt(id);
    const linkIdNum = parseInt(linkId);

    // Verify user owns the goal
    const goal = await getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const success = await removeGoalLink(linkIdNum);

    if (!success) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    revalidatePath("/goals");
    revalidatePath(`/goals/${goal.slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing goal link:", error);
    return NextResponse.json(
      { error: "Failed to remove goal link" },
      { status: 500 }
    );
  }
}
