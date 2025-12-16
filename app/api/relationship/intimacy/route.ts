import { NextRequest, NextResponse } from "next/server";
import {
  createIntimacyEntry,
  getIntimacyEntries,
  getIntimacyEntriesInRange,
} from "@/lib/db/relationship";
import { requireAuthApi } from "@/lib/auth/server";
import { checkAchievement } from "@/lib/achievements";

/**
 * GET /api/relationship/intimacy
 * Query params:
 * - startDate & endDate: Get entries in date range
 * - No params: Get all intimacy entries
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

    let entries;

    // Get date range
    if (startDate && endDate) {
      entries = await getIntimacyEntriesInRange(startDate, endDate, userId);
    } else {
      // Get all
      entries = await getIntimacyEntries(userId);
    }

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching intimacy entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch intimacy entries" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/relationship/intimacy
 * Body: { date, time?, duration?, satisfaction_rating?, initiation?, type?, location?, mood_before?, mood_after?, positions?, notes? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
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

    // Create intimacy entry
    const entry = await createIntimacyEntry(
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

    // Check for achievements
    checkAchievement(userId, 'relationship').catch(console.error);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating intimacy entry:", error);
    return NextResponse.json(
      { error: "Failed to create intimacy entry" },
      { status: 500 }
    );
  }
}
