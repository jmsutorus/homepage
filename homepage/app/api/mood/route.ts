import { NextRequest, NextResponse } from "next/server";
import {
  createMoodEntry,
  getMoodEntry,
  getMoodEntriesInRange,
  getMoodEntriesForYear,
  getAllMoodEntries,
} from "@/lib/db/mood";

/**
 * GET /api/mood
 * Query params:
 * - date: Get mood for specific date (YYYY-MM-DD)
 * - year: Get all moods for a year (YYYY)
 * - startDate & endDate: Get moods in date range
 * - No params: Get all mood entries
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const year = searchParams.get("year");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get specific date
    if (date) {
      const entry = getMoodEntry(date);
      if (!entry) {
        return NextResponse.json({ error: "Mood entry not found" }, { status: 404 });
      }
      return NextResponse.json(entry);
    }

    // Get year
    if (year) {
      const entries = getMoodEntriesForYear(parseInt(year, 10));
      return NextResponse.json(entries);
    }

    // Get date range
    if (startDate && endDate) {
      const entries = getMoodEntriesInRange(startDate, endDate);
      return NextResponse.json(entries);
    }

    // Get all
    const entries = getAllMoodEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch mood entries" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mood
 * Body: { date: string, rating: number, note?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, rating, note } = body;

    // Validate input
    if (!date || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: date and rating" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Create or update mood entry
    const entry = createMoodEntry(date, rating, note);

    return NextResponse.json(entry, { status: 200 });
  } catch (error) {
    console.error("Error creating mood entry:", error);
    return NextResponse.json(
      { error: "Failed to create mood entry" },
      { status: 500 }
    );
  }
}
