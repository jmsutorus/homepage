import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/server";
import { getParkBySlug, updateParkPhoto, deleteParkPhoto, getParkPhoto } from "@/lib/db/parks";
import { getAdminStorage } from "@/lib/firebase/admin";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const userId = await getUserId();
    const { slug, id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const park = await getParkBySlug(slug, userId);
    if (!park) {
      return NextResponse.json({ error: "Park not found" }, { status: 404 });
    }

    const body = await request.json();
    const photoId = parseInt(id, 10);

    // Handle photo cleanup if url is being updated
    if (body.url !== undefined) {
      const existingPhoto = await getParkPhoto(photoId, park.id);
      if (existingPhoto && existingPhoto.url && existingPhoto.url !== body.url) {
        if (existingPhoto.url.includes("firebasestorage.googleapis.com")) {
          try {
            const bucket = getAdminStorage().bucket();
            const urlObj = new URL(existingPhoto.url);
            const pathPart = urlObj.pathname.split("/o/")[1];
            if (pathPart) {
              const filePath = decodeURIComponent(pathPart);
              const oldFile = bucket.file(filePath);
              const [exists] = await oldFile.exists();
              if (exists) {
                await oldFile.delete();
                console.log(`Deleted old park photo during PUT: ${filePath}`);
              }
            }
          } catch (err) {
            console.error("Failed to delete old park photo during PUT:", err);
          }
        }
      }
    }

    const success = await updateParkPhoto(photoId, park.id, {
      url: body.url,
      caption: body.caption,
      date_taken: body.date_taken,
      order_index: body.order_index,
    });

    if (!success) {
      return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating park photo:", error);
    return NextResponse.json(
      { error: "Failed to update photo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const userId = await getUserId();
    const { slug, id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const park = await getParkBySlug(slug, userId);
    if (!park) {
      return NextResponse.json({ error: "Park not found" }, { status: 404 });
    }

    const photoId = parseInt(id, 10);
    const existingPhoto = await getParkPhoto(photoId, park.id);
    
    // Delete from Storage if it exists
    if (existingPhoto && existingPhoto.url && existingPhoto.url.includes("firebasestorage.googleapis.com")) {
      try {
        const bucket = getAdminStorage().bucket();
        const urlObj = new URL(existingPhoto.url);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted park photo during DELETE: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete park photo from storage:", err);
      }
    }

    const success = await deleteParkPhoto(photoId, park.id);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting park photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
