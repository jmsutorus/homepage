import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationBySlug,
  createBooking,
  getBookings,
  getBookingsByType,
  type BookingInput,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/vacations/[slug]/bookings
 * Get all bookings for a vacation (optionally filtered by type)
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

    // Check for type filter in query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const bookings = type
      ? await getBookingsByType(vacation.id, type)
      : await getBookings(vacation.id);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vacations/[slug]/bookings
 * Add a booking to a vacation
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

    // Validate required fields
    if (!body.type || !body.title) {
      return NextResponse.json(
        { error: "Type and title are required" },
        { status: 400 }
      );
    }

    const bookingInput: BookingInput = {
      type: body.type,
      title: body.title,
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      confirmation_number: body.confirmation_number,
      provider: body.provider,
      location: body.location,
      cost: body.cost,
      status: body.status || 'pending',
      notes: body.notes,
      url: body.url,
    };

    const booking = await createBooking(vacation.id, bookingInput);

    // Revalidate paths
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create booking" },
      { status: 500 }
    );
  }
}
