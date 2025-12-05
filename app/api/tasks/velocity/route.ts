import { NextRequest, NextResponse } from "next/server";
import { getTaskVelocityData, VelocityPeriod } from "@/lib/db/tasks";
import { getUserId, requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/tasks/velocity
 * Query params:
 * - period: "day" | "week" | "month" (default: "week")
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
    const period = (searchParams.get("period") as VelocityPeriod) || "week";
    const periods = parseInt(searchParams.get("periods") || "12", 10);

    // Validate period
    if (!["day", "week", "month"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Must be day, week, or month" },
        { status: 400 }
      );
    }

    // Validate periods count
    const validPeriods = Math.min(Math.max(periods, 1), 52);

    const velocityData = await getTaskVelocityData(userId, period, validPeriods);
    return NextResponse.json(velocityData);
  } catch (error) {
    console.error("Error fetching task velocity:", error);
    return NextResponse.json(
      { error: "Failed to fetch task velocity data" },
      { status: 500 }
    );
  }
}
