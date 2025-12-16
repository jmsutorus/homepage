import { NextRequest, NextResponse } from "next/server";
import {
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
} from "@/lib/db/relationship";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/relationship/milestones/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
    const milestoneId = parseInt(id, 10);

    if (isNaN(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
    }

    const milestone = await getMilestoneById(milestoneId, userId);

    if (!milestone) {
      return NextResponse.json({ error: "Relationship milestone not found" }, { status: 404 });
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Error fetching relationship milestone:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationship milestone" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/relationship/milestones/[id]
 * Body: { title, date, category, description?, photos? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
    const milestoneId = parseInt(id, 10);

    if (isNaN(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
    }

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

    // Update relationship milestone
    const success = await updateMilestone(
      milestoneId,
      title,
      date,
      category,
      description,
      photos,
      userId
    );

    if (!success) {
      return NextResponse.json(
        { error: "Relationship milestone not found or not updated" },
        { status: 404 }
      );
    }

    // Fetch updated milestone
    const updatedMilestone = await getMilestoneById(milestoneId, userId);

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error("Error updating relationship milestone:", error);
    return NextResponse.json(
      { error: "Failed to update relationship milestone" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/relationship/milestones/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
    const milestoneId = parseInt(id, 10);

    if (isNaN(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
    }

    const success = await deleteMilestone(milestoneId, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Relationship milestone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting relationship milestone:", error);
    return NextResponse.json(
      { error: "Failed to delete relationship milestone" },
      { status: 500 }
    );
  }
}
