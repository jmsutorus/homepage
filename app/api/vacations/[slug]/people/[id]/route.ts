import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationBySlug,
  removePersonFromVacation,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string; id: string }>;
}

/**
 * DELETE /api/vacations/[slug]/people/[id]
 * Remove a person from a vacation
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

    const associationId = parseInt(id);
    if (isNaN(associationId)) {
      return NextResponse.json(
        { error: "Invalid person association ID" },
        { status: 400 }
      );
    }

    const success = await removePersonFromVacation(
      associationId,
      vacation.id,
      session.user.id
    );

    if (!success) {
      return NextResponse.json(
        { error: "Person association not found" },
        { status: 404 }
      );
    }

    // Revalidate vacation page
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing person from vacation:", error);
    return NextResponse.json(
      { error: "Failed to remove person from vacation" },
      { status: 500 }
    );
  }
}
