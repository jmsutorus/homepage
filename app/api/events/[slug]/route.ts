import { NextRequest, NextResponse } from "next/server";
import {
  getEventWithDetails,
  getEventBySlug,
  updateEvent,
  deleteEvent,
  type UpdateEventInput,
} from "@/lib/db/events";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/events/[slug]
 * Get event details with photos
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { slug } = await params;

    const eventData = await getEventWithDetails(slug, userId);
    if (!eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(eventData);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[slug]
 * Update event by slug
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { slug } = await params;
    const body = await request.json();

    // Get event by slug to find ID
    const event = await getEventBySlug(slug, userId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updates: UpdateEventInput = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.location !== undefined) updates.location = body.location;
    if (body.date !== undefined) updates.date = body.date;
    if (body.start_time !== undefined) updates.start_time = body.start_time;
    if (body.end_time !== undefined) updates.end_time = body.end_time;
    if (body.all_day !== undefined) updates.all_day = body.all_day;
    if (body.end_date !== undefined) updates.end_date = body.end_date;
    if (body.category !== undefined) updates.category = body.category;
    if (body.notifications !== undefined) updates.notifications = body.notifications;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.content !== undefined) updates.content = body.content;

    const success = await updateEvent(event.id, userId, updates);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update event" },
        { status: 500 }
      );
    }

    // Return updated event data
    const updatedSlug = body.slug || slug;
    const updatedData = await getEventWithDetails(updatedSlug, userId);
    return NextResponse.json(updatedData);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[slug]
 * Delete event by slug
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { slug } = await params;

    // Get event by slug to find ID
    const event = await getEventBySlug(slug, userId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const success = await deleteEvent(event.id, userId);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
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
