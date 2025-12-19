import { NextRequest, NextResponse } from "next/server";
import {
  getEventBySlug,
  getEventPhoto,
  updateEventPhoto,
  deleteEventPhoto,
  type EventPhotoInput,
} from "@/lib/db/events";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string; id: string }>;
}

/**
 * GET /api/events/[slug]/photos/[id]
 * Get a single photo
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { slug, id } = await params;

    // Get event by slug to find ID
    const event = await getEventBySlug(slug, userId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const photo = await getEventPhoto(parseInt(id, 10), event.id);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error fetching event photo:", error);
    return NextResponse.json(
      { error: "Failed to fetch event photo" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[slug]/photos/[id]
 * Update a photo
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { slug, id } = await params;
    const body = await request.json();

    // Get event by slug to find ID
    const event = await getEventBySlug(slug, userId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updates: Partial<EventPhotoInput> = {};
    if (body.url !== undefined) updates.url = body.url;
    if (body.caption !== undefined) updates.caption = body.caption;
    if (body.date_taken !== undefined) updates.date_taken = body.date_taken;
    if (body.order_index !== undefined) updates.order_index = body.order_index;

    const success = await updateEventPhoto(parseInt(id, 10), event.id, updates);

    if (!success) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const updatedPhoto = await getEventPhoto(parseInt(id, 10), event.id);
    return NextResponse.json(updatedPhoto);
  } catch (error) {
    console.error("Error updating event photo:", error);
    return NextResponse.json(
      { error: "Failed to update event photo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[slug]/photos/[id]
 * Delete a photo
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { slug, id } = await params;

    // Get event by slug to find ID
    const event = await getEventBySlug(slug, userId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const success = await deleteEventPhoto(parseInt(id, 10), event.id);

    if (!success) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event photo:", error);
    return NextResponse.json(
      { error: "Failed to delete event photo" },
      { status: 500 }
    );
  }
}
