import { NextRequest, NextResponse } from "next/server";
import {
  createRelationshipMilestone,
  getMilestones,
  getMilestonesInRange,
} from "@/lib/db/relationship";
import { requireAuthApi } from "@/lib/auth/server";
import { checkAchievement } from "@/lib/achievements";

/**
 * GET /api/relationship/milestones
 * Query params:
 * - startDate & endDate: Get milestones in date range
 * - category: Filter by category
 * - No params: Get all relationship milestones
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryFilter = searchParams.get("category");

    let milestones;

    // Get date range
    if (startDate && endDate) {
      milestones = await getMilestonesInRange(startDate, endDate, userId);
    } else {
      // Get all
      milestones = await getMilestones(userId);
    }

    // Filter by category if provided
    if (categoryFilter) {
      milestones = milestones.filter(m => m.category === categoryFilter);
    }

    return NextResponse.json(milestones);
  } catch (error) {
    console.error("Error fetching relationship milestones:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationship milestones" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/relationship/milestones
 * Body: { title, date, category, description?, photos? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { title, date, category, description, photos } = body;

    // Validate required fields
    if (!title || !date || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, date, and category" },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.length < 3) {
      return NextResponse.json(
        { error: "Title must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Create relationship milestone
    const milestone = await createRelationshipMilestone(
      title,
      date,
      category,
      description,
      photos,
      userId
    );

    // Check for achievements
    checkAchievement(userId, 'relationship').catch(console.error);

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Error creating relationship milestone:", error);
    return NextResponse.json(
      { error: "Failed to create relationship milestone" },
      { status: 500 }
    );
  }
}
