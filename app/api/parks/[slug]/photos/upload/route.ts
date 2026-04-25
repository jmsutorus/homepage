import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireAuthApi } from "@/lib/auth/server";
import { getParkBySlug, createParkPhoto } from "@/lib/db/parks";
import { getDownloadURL } from "firebase-admin/storage";
import { revalidatePath } from "next/cache";
import { convertToWebP } from "@/lib/services/image-processor";

/**
 * POST /api/parks/[slug]/photos/upload
 * Handles gallery photo upload to Firebase Storage via Admin SDK
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { slug } = await params;

    // Get park by slug
    const park = await getParkBySlug(slug, userId);
    if (!park) {
      return NextResponse.json({ error: "Park not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string | null;
    const dateTaken = formData.get("date_taken") as string | null;
    const orderIndex = formData.get("order_index") ? parseInt(formData.get("order_index") as string, 10) : undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Prepare for upload
    const { buffer, fileName: convertedFileName, contentType } = await convertToWebP(file);
    const fileExt = convertedFileName.split('.').pop();
    const fileName = `parks/${park.id}/gallery/photo-${Date.now()}.${fileExt}`;
    
    const bucket = getAdminStorage().bucket();

    // 2. Upload photo
    const storageFile = bucket.file(fileName);
    await storageFile.save(buffer, {
      metadata: {
        contentType: contentType,
      },
    });

    // 3. Get the Download URL
    const downloadURL = await getDownloadURL(storageFile);

    // 4. Update the database
    const photo = await createParkPhoto(park.id, {
      url: downloadURL,
      caption: caption || null,
      date_taken: dateTaken || null,
      order_index: orderIndex
    });

    if (!photo) {
      return NextResponse.json({ error: "Failed to create database record" }, { status: 500 });
    }

    revalidatePath(`/parks/${slug}`);

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Error in server-side park gallery upload:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
