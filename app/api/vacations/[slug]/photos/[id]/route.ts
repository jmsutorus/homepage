import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationBySlug,
  getVacationPhoto,
  deleteVacationPhoto,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";
import { getAdminStorage } from "@/lib/firebase/admin";

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
    if (photo.url.includes("firebasestorage.googleapis.com")) {
      try {
        // Extract path from URL
        // Example: .../o/vacations%2F12%2Fphotos%2Fphoto-123.jpg?alt=media...
        const urlObj = new URL(photo.url);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const bucket = getAdminStorage().bucket();
          const storageFile = bucket.file(filePath);
          
          const [exists] = await storageFile.exists();
          if (exists) {
            await storageFile.delete();
            console.log(`Deleted file from storage: ${filePath}`);
          }
        }
      } catch (storageError) {
        // Log but continue - we want to remove the DB record even if storage delete fails
        console.error("Error deleting from Firebase Storage:", storageError);
      }
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
