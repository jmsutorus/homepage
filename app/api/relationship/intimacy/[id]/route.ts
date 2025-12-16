import { NextRequest, NextResponse } from "next/server";
import {
  getIntimacyEntryById,
  updateIntimacyEntry,
  deleteIntimacyEntry,
} from "@/lib/db/relationship";
import { requireAuthApi } from "@/lib/auth/server";
import { checkAchievement } from "@/lib/achievements";

/**
 * GET /api/relationship/intimacy/[id]
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
    const entryId = parseInt(id, 10);

    if (isNaN(entryId)) {
      return NextResponse.json({ error: "Invalid entry ID" }, { status: 400 });
    }

    const entry = await getIntimacyEntryById(entryId, userId);

    if (!entry) {
      return NextResponse.json({ error: "Intimacy entry not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error fetching intimacy entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch intimacy entry" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/relationship/intimacy/[id]
 * Body: { date, time?, duration?, satisfaction_rating?, initiation?, type?, location?, mood_before?, mood_after?, positions?, notes? }
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
    const entryId = parseInt(id, 10);

    if (isNaN(entryId)) {
      return NextResponse.json({ error: "Invalid entry ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      date,
      time,
      duration,
      satisfaction_rating,
      initiation,
      type,
      location,
      mood_before,
      mood_after,
      positions,
      notes
    } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json(
        { error: "Missing required field: date" },
        { status: 400 }
      );
    }

    // Validate satisfaction rating if provided
    if (satisfaction_rating !== undefined && satisfaction_rating !== null && (satisfaction_rating < 1 || satisfaction_rating > 5)) {
      return NextResponse.json(
        { error: "Satisfaction rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate duration if provided
    if (duration !== undefined && duration !== null && duration < 0) {
      return NextResponse.json(
        { error: "Duration must be non-negative" },
        { status: 400 }
      );
    }

    // Update intimacy entry
    const success = await updateIntimacyEntry(
      entryId,
      date,
      time,
      duration,
      satisfaction_rating,
      initiation,
      type,
      location,
      mood_before,
      mood_after,
      positions,
      notes,
      userId
    );

    if (!success) {
      return NextResponse.json(
        { error: "Intimacy entry not found or not updated" },
        { status: 404 }
      );
    }

    // Check for achievements (in case satisfaction rating changed)
    checkAchievement(userId, 'relationship').catch(console.error);

    // Fetch updated entry
    const updatedEntry = await getIntimacyEntryById(entryId, userId);

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error updating intimacy entry:", error);
    return NextResponse.json(
      { error: "Failed to update intimacy entry" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/relationship/intimacy/[id]
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
    const entryId = parseInt(id, 10);

    if (isNaN(entryId)) {
      return NextResponse.json({ error: "Invalid entry ID" }, { status: 400 });
    }

    const success = await deleteIntimacyEntry(entryId, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Intimacy entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting intimacy entry:", error);
    return NextResponse.json(
      { error: "Failed to delete intimacy entry" },
      { status: 500 }
    );
  }
}
