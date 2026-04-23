import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationBySlug,
  getVacationPhoto,
  deleteVacationPhoto,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";
import { deleteFromStorage } from "@/lib/firebase/storage-utils";

interface RouteParams {
  params: Promise<{ slug: string; id: string }>;
}

/**
 * DELETE /api/vacations/[slug]/photos/[id]
 * Deletes a photo from a vacation (both from DB and Firebase Storage if applicable)
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

    const { slug, id: photoIdStr } = await context.params;
    const photoId = parseInt(photoIdStr);
    const userId = session.user.id;

    // 1. Verify vacation ownership
    const vacation = await getVacationBySlug(slug, userId);
    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    // 2. Get the photo details
    const photo = await getVacationPhoto(photoId, vacation.id);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // 3. If it's a Firebase Storage URL, delete from Storage
    if (photo.url) {
      await deleteFromStorage(photo.url);
    }

    // 4. Delete from Database
    const success = await deleteVacationPhoto(photoId, vacation.id);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete photo from database" }, { status: 500 });
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
