import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getEventBySlug,
  removePersonFromEvent,
} from "@/lib/db/events";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string; id: string }>;
}

/**
 * DELETE /api/events/[slug]/people/[id]
 * Remove a person from an event
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
    const event = await getEventBySlug(slug, session.user.id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const associationId = parseInt(id);
    if (isNaN(associationId)) {
      return NextResponse.json(
        { error: "Invalid person association ID" },
        { status: 400 }
      );
    }

    const success = await removePersonFromEvent(
      associationId,
      event.id,
      session.user.id
    );

    if (!success) {
      return NextResponse.json(
        { error: "Person association not found" },
        { status: 404 }
      );
    }

    // Revalidate event page
    revalidatePath(`/events/${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing person from event:", error);
    return NextResponse.json(
      { error: "Failed to remove person from event" },
      { status: 500 }
    );
  }
}
