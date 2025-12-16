import { NextRequest, NextResponse } from "next/server";
import {
  getRelationshipDateById,
  updateRelationshipDate,
  deleteRelationshipDate,
} from "@/lib/db/relationship";
import { requireAuthApi } from "@/lib/auth/server";
import { checkAchievement } from "@/lib/achievements";

/**
 * GET /api/relationship/dates/[id]
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
    const dateId = parseInt(id, 10);

    if (isNaN(dateId)) {
      return NextResponse.json({ error: "Invalid date ID" }, { status: 400 });
    }

    const relationshipDate = await getRelationshipDateById(dateId, userId);

    if (!relationshipDate) {
      return NextResponse.json({ error: "Relationship date not found" }, { status: 404 });
    }

    return NextResponse.json(relationshipDate);
  } catch (error) {
    console.error("Error fetching relationship date:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationship date" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/relationship/dates/[id]
 * Body: { date, time?, type, location?, venue?, rating?, cost?, photos?, notes? }
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
    const dateId = parseInt(id, 10);

    if (isNaN(dateId)) {
      return NextResponse.json({ error: "Invalid date ID" }, { status: 400 });
    }

    const body = await request.json();
    const { date, time, type, location, venue, rating, cost, photos, notes } = body;

    // Validate required fields
    if (!date || !type) {
      return NextResponse.json(
        { error: "Missing required fields: date and type" },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate cost if provided
    if (cost !== undefined && cost !== null && cost < 0) {
      return NextResponse.json(
        { error: "Cost must be non-negative" },
        { status: 400 }
      );
    }

    // Update relationship date
    const success = await updateRelationshipDate(
      dateId,
      date,
      time,
      type,
      location,
      venue,
      rating,
      cost,
      photos,
      notes,
      userId
    );

    if (!success) {
      return NextResponse.json(
        { error: "Relationship date not found or not updated" },
        { status: 404 }
      );
    }

    // Check for achievements (in case rating changed)
    checkAchievement(userId, 'relationship').catch(console.error);

    // Fetch updated date
    const updatedDate = await getRelationshipDateById(dateId, userId);

    return NextResponse.json(updatedDate);
  } catch (error) {
    console.error("Error updating relationship date:", error);
    return NextResponse.json(
      { error: "Failed to update relationship date" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/relationship/dates/[id]
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
    const dateId = parseInt(id, 10);

    if (isNaN(dateId)) {
      return NextResponse.json({ error: "Invalid date ID" }, { status: 400 });
    }

    const success = await deleteRelationshipDate(dateId, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Relationship date not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting relationship date:", error);
    return NextResponse.json(
      { error: "Failed to delete relationship date" },
      { status: 500 }
    );
  }
}
