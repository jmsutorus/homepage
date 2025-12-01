import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    // Get Strava activities for the specific date
    // Note: Strava's start_date is in ISO format with timezone, so we need to match on the date part
    const activities = await query(
      `SELECT id, name, distance, moving_time, type, sport_type, start_date, start_date_local
       FROM strava_activities
       WHERE date(start_date_local) = ?
       ORDER BY start_date_local DESC`,
      [date]
    );

    return NextResponse.json({ activities, date });
  } catch (error) {
    console.error("Error fetching Strava activities by date:", error);
    return NextResponse.json(
      { error: "Failed to fetch Strava activities" },
      { status: 500 }
    );
  }
}
