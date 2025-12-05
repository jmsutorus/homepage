import { NextRequest, NextResponse } from "next/server";
import {
  createEvent,
  getEvent,
  getAllEvents,
  getEventsForDate,
  getEventsInRange,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  type CreateEventInput,
  type UpdateEventInput,
} from "@/lib/db/events";
import { getUserId, requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/events
 * Query params:
 * - id: Get specific event by ID
 * - date: Get events for specific date (YYYY-MM-DD)
 * - startDate & endDate: Get events in date range
 * - upcoming: Get upcoming events (with optional limit)
 * - No params: Get all events
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const upcoming = searchParams.get("upcoming");
    const limit = searchParams.get("limit");

    // Get specific event by ID
    if (id) {
      const event = await getEvent(parseInt(id, 10), userId);
      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      return NextResponse.json(event);
    }

    // Get events for specific date
    if (date) {
      const events = await getEventsForDate(date, userId);
      return NextResponse.json(events);
    }

    // Get events in date range
    if (startDate && endDate) {
      const events = await getEventsInRange(startDate, endDate, userId);
      return NextResponse.json(events);
    }

    // Get upcoming events
    if (upcoming === "true") {
      const limitNum = limit ? parseInt(limit, 10) : undefined;
      const events = await getUpcomingEvents(userId, limitNum);
      return NextResponse.json(events);
    }

    // Get all events
    const events = await getAllEvents(userId);
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Body: CreateEventInput
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.date) {
      return NextResponse.json(
        { error: "Missing required fields: title and date" },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Validate end_date if provided
    if (body.end_date && !dateRegex.test(body.end_date)) {
      return NextResponse.json(
        { error: "Invalid end_date format. Expected YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Validate time format if provided (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (body.start_time && !timeRegex.test(body.start_time)) {
      return NextResponse.json(
        { error: "Invalid start_time format. Expected HH:MM" },
        { status: 400 }
      );
    }
    if (body.end_time && !timeRegex.test(body.end_time)) {
      return NextResponse.json(
        { error: "Invalid end_time format. Expected HH:MM" },
        { status: 400 }
      );
    }

    const input: CreateEventInput = {
      title: body.title,
      description: body.description,
      location: body.location,
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      all_day: body.all_day || false,
      end_date: body.end_date,
      notifications: body.notifications || [],
    };

    const event = await createEvent(input, userId);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/events
 * Query params: id (required)
 * Body: UpdateEventInput
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required await query parameter: id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: UpdateEventInput = {};

    // Validate and collect updates
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.location !== undefined) updates.location = body.location;
    if (body.date !== undefined) updates.date = body.date;
    if (body.start_time !== undefined) updates.start_time = body.start_time;
    if (body.end_time !== undefined) updates.end_time = body.end_time;
    if (body.all_day !== undefined) updates.all_day = body.all_day;
    if (body.end_date !== undefined) updates.end_date = body.end_date;
    if (body.notifications !== undefined) updates.notifications = body.notifications;

    const success = await updateEvent(parseInt(id, 10), userId, updates);

    if (!success) {
      return NextResponse.json(
        { error: "Event not found or no changes made" },
        { status: 404 }
      );
    }

    const event = await getEvent(parseInt(id, 10), userId);
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events
 * Query params: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required await query parameter: id" },
        { status: 400 }
      );
    }

    const success = await deleteEvent(parseInt(id, 10), userId);

    if (!success) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
