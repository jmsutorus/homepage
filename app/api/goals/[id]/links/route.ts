import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getGoalById, getGoalLinks, addGoalLink, replaceGoalLinks, GoalLinkType } from "@/lib/db/goals";
import { getUserId, requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/goals/[id]/links
 * Get all links for a goal
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;
    const goalId = parseInt(id);

    // Verify user owns the goal
    const goal = await getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const links = await getGoalLinks(goalId);
    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching goal links:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal links" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals/[id]/links
 * Add a new link to a goal
 * Body: { linked_type: string, linked_id: number, linked_slug?: string, note?: string }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;
    const goalId = parseInt(id);

    // Verify user owns the goal
    const goal = await getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const { linked_type, linked_id, linked_slug, note } = body;

    if (!linked_type || !linked_id) {
      return NextResponse.json(
        { error: "linked_type and linked_id are required" },
        { status: 400 }
      );
    }

    const link = await addGoalLink(
      userId,
      goalId,
      linked_type as GoalLinkType,
      linked_id,
      linked_slug,
      note
    );

    revalidatePath("/goals");
    revalidatePath(`/goals/${goal.slug}`);

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Error adding goal link:", error);
    return NextResponse.json(
      { error: "Failed to add goal link" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/goals/[id]/links
 * Replace all links for a goal
 * Body: { links: Array<{ linked_type: string, linked_id: number, linked_slug?: string, note?: string }> }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;
    const goalId = parseInt(id);

    // Verify user owns the goal
    const goal = await getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const { links } = body;

    if (!Array.isArray(links)) {
      return NextResponse.json(
        { error: "links must be an array" },
        { status: 400 }
      );
    }

    const newLinks = await replaceGoalLinks(userId, goalId, links);

    revalidatePath("/goals");
    revalidatePath(`/goals/${goal.slug}`);

    return NextResponse.json(newLinks);
  } catch (error) {
    console.error("Error replacing goal links:", error);
    return NextResponse.json(
      { error: "Failed to replace goal links" },
      { status: 500 }
    );
  }
}
