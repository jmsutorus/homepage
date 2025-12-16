import { NextRequest, NextResponse } from "next/server";
import {
  createRelationshipDate,
  getRelationshipDates,
  getRelationshipDatesInRange,
} from "@/lib/db/relationship";
import { requireAuthApi } from "@/lib/auth/server";
import { checkAchievement } from "@/lib/achievements";

/**
 * GET /api/relationship/dates
 * Query params:
 * - startDate & endDate: Get dates in date range
 * - type: Filter by date type
 * - No params: Get all relationship dates
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
    const typeFilter = searchParams.get("type");

    let dates;

    // Get date range
    if (startDate && endDate) {
      dates = await getRelationshipDatesInRange(startDate, endDate, userId);
    } else {
      // Get all
      dates = await getRelationshipDates(userId);
    }

    // Filter by type if provided
    if (typeFilter) {
      dates = dates.filter(d => d.type === typeFilter);
    }

    return NextResponse.json(dates);
  } catch (error) {
    console.error("Error fetching relationship dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationship dates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/relationship/dates
 * Body: { date, time?, type, location?, venue?, rating?, cost?, photos?, notes? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
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

    // Create relationship date
    const relationshipDate = await createRelationshipDate(
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

    // Check for achievements
    checkAchievement(userId, 'relationship').catch(console.error);

    return NextResponse.json(relationshipDate, { status: 201 });
  } catch (error) {
    console.error("Error creating relationship date:", error);
    return NextResponse.json(
      { error: "Failed to create relationship date" },
      { status: 500 }
    );
  }
}
