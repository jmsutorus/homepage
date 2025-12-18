import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationBySlug,
  getVacationPhoto,
  updateVacationPhoto,
  deleteVacationPhoto,
  type VacationPhotoInput,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string; id: string }>;
}

/**
 * GET /api/vacations/[slug]/photos/[id]
 * Get a single photo
 */
export async function GET(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await context.params;
    const photoId = parseInt(id, 10);

    if (isNaN(photoId)) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    const vacation = await getVacationBySlug(slug, session.user.id);

    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    const photo = await getVacationPhoto(photoId, vacation.id);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/vacations/[slug]/photos/[id]
 * Update a photo
 */
export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await context.params;
    const photoId = parseInt(id, 10);

    if (isNaN(photoId)) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    const vacation = await getVacationBySlug(slug, session.user.id);

    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    const body = await request.json();

    const photoInput: Partial<VacationPhotoInput> = {};
    if (body.url !== undefined) photoInput.url = body.url;
    if (body.caption !== undefined) photoInput.caption = body.caption;
    if (body.date_taken !== undefined) photoInput.date_taken = body.date_taken;
    if (body.order_index !== undefined) photoInput.order_index = body.order_index;

    const updated = await updateVacationPhoto(photoId, vacation.id, photoInput);

    if (!updated) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Get the updated photo
    const photo = await getVacationPhoto(photoId, vacation.id);

    // Revalidate paths
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json({
      success: true,
      photo,
    });
  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update photo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vacations/[slug]/photos/[id]
 * Delete a photo
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await context.params;
    const photoId = parseInt(id, 10);

    if (isNaN(photoId)) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    const vacation = await getVacationBySlug(slug, session.user.id);

    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    const deleted = await deleteVacationPhoto(photoId, vacation.id);

    if (!deleted) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Revalidate paths
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete photo" },
      { status: 500 }
    );
  }
}
