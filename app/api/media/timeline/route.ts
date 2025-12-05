import { NextRequest, NextResponse } from "next/server";
import { getMediaTimelineData, TimelinePeriod } from "@/lib/db/media";
import { getUserId, requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/media/timeline
 * Query params:
 * - period: "week" | "month" | "year" (default: "month")
 * - periods: number of periods to return (default: 12)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get("period") as TimelinePeriod) || "month";
    const periods = parseInt(searchParams.get("periods") || "12", 10);

    // Validate period
    if (!["week", "month", "year"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Must be week, month, or year" },
        { status: 400 }
      );
    }

    // Validate periods count
    const validPeriods = Math.min(Math.max(periods, 1), 52);


    const timelineData = await getMediaTimelineData(userId, period, validPeriods);
    return NextResponse.json(timelineData);
  } catch (error) {
    console.error("Error fetching media timeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch media timeline data" },
      { status: 500 }
    );
  }
}
