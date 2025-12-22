import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getParkBySlug,
  removePersonFromPark,
} from "@/lib/db/parks";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string; id: string }>;
}

/**
 * DELETE /api/parks/[slug]/people/[id]
 * Remove a person from a park
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
    const park = await getParkBySlug(slug, session.user.id);

    if (!park) {
      return NextResponse.json({ error: "Park not found" }, { status: 404 });
    }

    const associationId = parseInt(id);
    if (isNaN(associationId)) {
      return NextResponse.json(
        { error: "Invalid person association ID" },
        { status: 400 }
      );
    }

    const success = await removePersonFromPark(
      associationId,
      park.id,
      session.user.id
    );

    if (!success) {
      return NextResponse.json(
        { error: "Person association not found" },
        { status: 404 }
      );
    }

    // Revalidate park page
    revalidatePath(`/parks/${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing person from park:", error);
    return NextResponse.json(
      { error: "Failed to remove person from park" },
      { status: 500 }
    );
  }
}
