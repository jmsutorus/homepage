import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationBySlug,
  updateBooking,
  deleteBooking,
  type BookingInput,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string; id: string }>;
}

/**
 * PATCH /api/vacations/[slug]/bookings/[id]
 * Update a booking
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
    const updateData: Partial<BookingInput> = {};

    if (body.type !== undefined) updateData.type = body.type;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.start_time !== undefined) updateData.start_time = body.start_time;
    if (body.end_time !== undefined) updateData.end_time = body.end_time;
    if (body.confirmation_number !== undefined) updateData.confirmation_number = body.confirmation_number;
    if (body.provider !== undefined) updateData.provider = body.provider;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.cost !== undefined) updateData.cost = body.cost;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.url !== undefined) updateData.url = body.url;

    const success = await updateBooking(
      parseInt(id),
      vacation.id,
      updateData
    );

    if (!success) {
      return NextResponse.json(
        { error: "Booking not found or update failed" },
        { status: 404 }
      );
    }

    // Revalidate paths
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update booking" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vacations/[slug]/bookings/[id]
 * Delete a booking
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

    const success = await deleteBooking(parseInt(id), vacation.id);

    if (!success) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Revalidate paths
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
