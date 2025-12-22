import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getEventBySlug,
  addPersonToEvent,
  getEventPeople,
  isPersonOnEvent,
} from "@/lib/db/events";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/events/[slug]/people
 * Get all people associated with an event
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
    const event = await getEventBySlug(slug, session.user.id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const people = await getEventPeople(event.id);

    return NextResponse.json(people);
  } catch (error) {
    console.error("Error fetching event people:", error);
    return NextResponse.json(
      { error: "Failed to fetch event people" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/[slug]/people
 * Add a person to an event
 * Body: { personId: number }
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
    const event = await getEventBySlug(slug, session.user.id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const { personId } = body;

    // Validate personId
    if (!personId || typeof personId !== 'number') {
      return NextResponse.json(
        { error: "personId is required and must be a number" },
        { status: 400 }
      );
    }

    // Check if person is already on event
    const alreadyAssociated = await isPersonOnEvent(event.id, personId);
    if (alreadyAssociated) {
      return NextResponse.json(
        { error: "Person is already associated with this event" },
        { status: 409 }
      );
    }

    // Add person to event
    const eventPerson = await addPersonToEvent(
      event.id,
      personId,
      session.user.id
    );

    // Revalidate event page
    revalidatePath(`/events/${slug}`);

    return NextResponse.json(
      {
        success: true,
        eventPerson,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding person to event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add person to event" },
      { status: 500 }
    );
  }
}
