import { NextRequest, NextResponse } from "next/server";
import {
  getAllHolidays,
  getHolidaysForMonth,
  createHoliday,
  seedDefaultHolidays,
  type CreateHolidayInput,
} from "@/lib/db/holidays";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/holidays
 * Query params:
 * - month & year: Get holidays for specific month (optional)
 * - No params: Get all holidays
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Get holidays for specific month/year
    if (month && year) {
      const holidays = await getHolidaysForMonth(
        parseInt(month, 10),
        parseInt(year, 10)
      );
      return NextResponse.json(holidays);
    }

    // Get all holidays
    const holidays = await getAllHolidays();
    return NextResponse.json(holidays);
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      { error: "Failed to fetch holidays" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/holidays
 * Body: CreateHolidayInput OR { action: "seed" } to seed defaults
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Handle seed action
    if (body.action === "seed") {
      const created = await seedDefaultHolidays();
      return NextResponse.json({ success: true, created });
    }

    // Validate required fields
    if (!body.name || !body.month || !body.day) {
      return NextResponse.json(
        { error: "Missing required fields: name, month, day" },
        { status: 400 }
      );
    }

    // Validate month range
    if (body.month < 1 || body.month > 12) {
      return NextResponse.json(
        { error: "Month must be between 1 and 12" },
        { status: 400 }
      );
    }

    // Validate day range
    if (body.day < 1 || body.day > 31) {
      return NextResponse.json(
        { error: "Day must be between 1 and 31" },
        { status: 400 }
      );
    }

    const input: CreateHolidayInput = {
      name: body.name,
      month: body.month,
      day: body.day,
      year: body.year ?? null,
    };

    const holiday = await createHoliday(input);
    return NextResponse.json(holiday, { status: 201 });
  } catch (error) {
    console.error("Error creating holiday:", error);
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "A holiday with this name and date already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create holiday" },
      { status: 500 }
    );
  }
}
