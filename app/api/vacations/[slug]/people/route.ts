import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationBySlug,
  addPersonToVacation,
  getVacationPeople,
  isPersonOnVacation,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/vacations/[slug]/people
 * Get all people associated with a vacation
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

    const people = await getVacationPeople(vacation.id);

    return NextResponse.json(people);
  } catch (error) {
    console.error("Error fetching vacation people:", error);
    return NextResponse.json(
      { error: "Failed to fetch vacation people" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vacations/[slug]/people
 * Add a person to a vacation
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
    const vacation = await getVacationBySlug(slug, session.user.id);

    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
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

    // Check if person is already on vacation
    const alreadyAssociated = await isPersonOnVacation(vacation.id, personId);
    if (alreadyAssociated) {
      return NextResponse.json(
        { error: "Person is already associated with this vacation" },
        { status: 409 }
      );
    }

    // Add person to vacation
    const vacationPerson = await addPersonToVacation(
      vacation.id,
      personId,
      session.user.id
    );

    // Revalidate vacation page
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json(
      {
        success: true,
        vacationPerson,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding person to vacation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add person to vacation" },
      { status: 500 }
    );
  }
}
