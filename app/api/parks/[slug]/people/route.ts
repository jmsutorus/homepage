import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getParkBySlug,
  addPersonToPark,
  getParkPeople,
  isPersonOnPark,
} from "@/lib/db/parks";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/parks/[slug]/people
 * Get all people associated with a park
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
    const park = await getParkBySlug(slug, session.user.id);

    if (!park) {
      return NextResponse.json({ error: "Park not found" }, { status: 404 });
    }

    const people = await getParkPeople(park.id);

    return NextResponse.json(people);
  } catch (error) {
    console.error("Error fetching park people:", error);
    return NextResponse.json(
      { error: "Failed to fetch park people" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/parks/[slug]/people
 * Add a person to a park
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
    const park = await getParkBySlug(slug, session.user.id);

    if (!park) {
      return NextResponse.json({ error: "Park not found" }, { status: 404 });
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

    // Check if person is already on park
    const alreadyAssociated = await isPersonOnPark(park.id, personId);
    if (alreadyAssociated) {
      return NextResponse.json(
        { error: "Person is already associated with this park" },
        { status: 409 }
      );
    }

    // Add person to park
    const parkPerson = await addPersonToPark(
      park.id,
      personId,
      session.user.id
    );

    if (!parkPerson) {
      return NextResponse.json(
        { error: "Failed to add person to park" },
        { status: 500 }
      );
    }

    // Revalidate park page
    revalidatePath(`/parks/${slug}`);

    return NextResponse.json(
      {
        success: true,
        parkPerson,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding person to park:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add person to park" },
      { status: 500 }
    );
  }
}
