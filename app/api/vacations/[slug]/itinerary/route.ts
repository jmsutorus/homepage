import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationBySlug,
  createItineraryDay,
  getItineraryDays,
  type ItineraryDayInput,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/vacations/[slug]/itinerary
 * Get all itinerary days for a vacation
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const vacation = await getVacationBySlug(slug, session.user.id);

    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    const itinerary = await getItineraryDays(vacation.id);
    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    return NextResponse.json(
      { error: "Failed to fetch itinerary" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vacations/[slug]/itinerary
 * Add an itinerary day (or multiple days if array provided)
 */
export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const vacation = await getVacationBySlug(slug, session.user.id);

    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    const body = await request.json();

    // Support both single day and array of days
    const daysToCreate = Array.isArray(body) ? body : [body];
    const createdDays = [];

    for (const dayData of daysToCreate) {
      // Validate required fields
      if (!dayData.date || !dayData.day_number) {
        return NextResponse.json(
          { error: "Date and day_number are required" },
          { status: 400 }
        );
      }

      const dayInput: ItineraryDayInput = {
        date: dayData.date,
        day_number: dayData.day_number,
        title: dayData.title,
        location: dayData.location,
        activities: dayData.activities,
        notes: dayData.notes,
        budget_planned: dayData.budget_planned,
        budget_actual: dayData.budget_actual,
      };

      const day = await createItineraryDay(vacation.id, dayInput);
      createdDays.push(day);
    }

    // Revalidate paths
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json(
      {
        success: true,
        days: createdDays,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating itinerary day:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create itinerary day" },
      { status: 500 }
    );
  }
}
