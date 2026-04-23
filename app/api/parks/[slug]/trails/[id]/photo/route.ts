import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireAuthApi } from "@/lib/auth/server";
import { getParkBySlug, updateParkTrail, getParkTrail } from "@/lib/db/parks";
import { getDownloadURL } from "firebase-admin/storage";
import { revalidatePath } from "next/cache";

/**
 * POST /api/parks/[slug]/trails/[id]/photo
 * Handles trail photo upload to Firebase Storage via Admin SDK
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { slug, id } = await params;
    const trailId = parseInt(id, 10);

    // Get park by slug
    const park = await getParkBySlug(slug, userId);
    if (!park) {
      return NextResponse.json({ error: "Park not found" }, { status: 404 });
    }

    const trail = await getParkTrail(trailId, park.id);
    if (!trail) {
      return NextResponse.json({ error: "Trail not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Prepare for upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `parks/${park.id}/trails/${trailId}/photo-${Date.now()}.${fileExt}`;
    
    const bucket = getAdminStorage().bucket();

    // 2. Delete old photo if it exists and is in Firebase Storage
    if (trail.photo_url && trail.photo_url.includes("firebasestorage.googleapis.com")) {
      try {
        const urlObj = new URL(trail.photo_url);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted old trail photo from storage: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete old trail photo from storage:", err);
      }
    }

    // 3. Upload new photo
    const storageFile = bucket.file(fileName);
    await storageFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // 4. Get the Download URL
    const downloadURL = await getDownloadURL(storageFile);

    // 5. Update the database
    await updateParkTrail(trailId, park.id, {
      photo_url: downloadURL
    });

    revalidatePath(`/parks/${slug}`);

    return NextResponse.json({ 
      success: true, 
      photoUrl: downloadURL 
    });
  } catch (error) {
    console.error("Error in server-side park trail photo upload:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
