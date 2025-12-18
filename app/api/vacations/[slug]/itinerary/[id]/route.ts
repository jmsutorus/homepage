import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationBySlug,
  updateItineraryDay,
  deleteItineraryDay,
  type ItineraryDayInput,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string; id: string }>;
}

/**
 * PATCH /api/vacations/[slug]/itinerary/[id]
 * Update an itinerary day
 */
export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await context.params;
    const vacation = await getVacationBySlug(slug, session.user.id);

    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Partial<ItineraryDayInput> = {};

    if (body.date !== undefined) updateData.date = body.date;
    if (body.day_number !== undefined) updateData.day_number = body.day_number;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.activities !== undefined) updateData.activities = body.activities;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.budget_planned !== undefined) updateData.budget_planned = body.budget_planned;
    if (body.budget_actual !== undefined) updateData.budget_actual = body.budget_actual;

    const success = await updateItineraryDay(
      parseInt(id),
      vacation.id,
      updateData
    );

    if (!success) {
      return NextResponse.json(
        { error: "Itinerary day not found or update failed" },
        { status: 404 }
      );
    }

    // Revalidate paths
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating itinerary day:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update itinerary day" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vacations/[slug]/itinerary/[id]
 * Delete an itinerary day
 */
export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await context.params;
    const vacation = await getVacationBySlug(slug, session.user.id);

    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    const success = await deleteItineraryDay(parseInt(id), vacation.id);

    if (!success) {
      return NextResponse.json(
        { error: "Itinerary day not found" },
        { status: 404 }
      );
    }

    // Revalidate paths
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting itinerary day:", error);
    return NextResponse.json(
      { error: "Failed to delete itinerary day" },
      { status: 500 }
    );
  }
}
