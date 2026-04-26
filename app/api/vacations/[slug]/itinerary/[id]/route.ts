import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationBySlug,
  getItineraryDay,
  updateItineraryDay,
  deleteItineraryDay,
  type ItineraryDayInput,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";
import { deleteFromStorage } from "@/lib/firebase/storage-utils";
import { cookies } from "next/headers";
import { scheduleItineraryDayNotifications, cancelItineraryDayNotifications } from "@/lib/firebase/notifications";

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

    // Handle photo cleanup if photo is being updated or removed
    if (body.photo !== undefined) {
      const existingDay = await getItineraryDay(parseInt(id), vacation.id);
      if (existingDay?.photo && existingDay.photo !== body.photo) {
        await deleteFromStorage(existingDay.photo);
      }
      updateData.photo = body.photo;
    }
    if (body.budget_planned !== undefined) updateData.budget_planned = body.budget_planned;
    if (body.budget_actual !== undefined) updateData.budget_actual = body.budget_actual;
    if (body.notification_setting !== undefined) updateData.notification_setting = body.notification_setting;

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

    try {
      await cancelItineraryDayNotifications(parseInt(id), session.user.id);
      const updatedDay = await getItineraryDay(parseInt(id), vacation.id);
      if (updatedDay) {
        const cookieStore = await cookies();
        const timezoneOffset = cookieStore.get("timezone-offset")?.value || "+00:00";
        await scheduleItineraryDayNotifications(updatedDay, session.user.id, timezoneOffset);
      }
    } catch (e) {
      console.error("Failed to update notifications for itinerary day:", e);
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

    // Get existing day to check for photo
    const day = await getItineraryDay(parseInt(id), vacation.id);
    if (day?.photo) {
      await deleteFromStorage(day.photo);
    }

    const success = await deleteItineraryDay(parseInt(id), vacation.id);

    try {
      await cancelItineraryDayNotifications(parseInt(id), session.user.id);
    } catch (e) {
      console.error("Failed to cancel notifications for deleted itinerary day:", e);
    }

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
