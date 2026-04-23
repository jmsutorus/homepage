import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireAuthApi } from "@/lib/auth/server";
import { getEventBySlug, createEventPhoto, getEventPhotos, deleteEventPhoto } from "@/lib/db/events";
import { getDownloadURL } from "firebase-admin/storage";
import { revalidatePath } from "next/cache";

/**
 * POST /api/events/[slug]/photos/upload
 * Handles file upload to Firebase Storage via Admin SDK for Events
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { slug } = await params;

    // Get event by slug to find ID
    const event = await getEventBySlug(slug, userId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Upload to Firebase Storage via Admin SDK
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `events/${event.id}/photo-${Date.now()}.${fileExt}`;
    
    const bucket = getAdminStorage().bucket();

    // 0. Cleanup old hero photo (order_index: 0) if it exists
    try {
      const photos = await getEventPhotos(event.id);
      const oldHero = photos.find(p => p.order_index === 0);
      
      if (oldHero) {
        // Delete from Storage if it's a Firebase URL
        if (oldHero.url.includes("firebasestorage.googleapis.com")) {
          const urlObj = new URL(oldHero.url);
          const pathPart = urlObj.pathname.split("/o/")[1];
          if (pathPart) {
            const filePath = decodeURIComponent(pathPart);
            const oldFile = bucket.file(filePath);
            const [exists] = await oldFile.exists();
            if (exists) {
              await oldFile.delete();
              console.log(`Deleted old event hero from storage: ${filePath}`);
            }
          }
        }
        // Delete from DB
        await deleteEventPhoto(oldHero.id, event.id);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up old event hero:", cleanupError);
    }
    const storageFile = bucket.file(fileName);

    await storageFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // 2. Get the Download URL
    const downloadURL = await getDownloadURL(storageFile);

    // 3. Create the event photo record in the database
    // We'll add it as the first photo (order_index: -1 or similar to make it the hero)
    // Actually, createEventPhoto handles order_index.
    // If we want it to be the new hero, we should probably give it a low order_index.
    // But for now, let's just add it to the gallery (it will be last by default).
    const photo = await createEventPhoto(event.id, {
      url: downloadURL,
      caption: file.name,
      order_index: 0, // Make it the first photo
    });

    revalidatePath(`/events/${slug}`);

    return NextResponse.json({ 
      success: true, 
      photoUrl: downloadURL,
      photo
    });
  } catch (error) {
    console.error("Error in server-side event photo upload:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
