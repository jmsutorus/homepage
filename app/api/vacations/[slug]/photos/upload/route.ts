import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireAuthApi } from "@/lib/auth/server";
import { getVacationBySlug, createVacationPhoto } from "@/lib/db/vacations";
import { getDownloadURL } from "firebase-admin/storage";
import { revalidatePath } from "next/cache";

/**
 * POST /api/vacations/[slug]/photos/upload
 * Handles gallery photo upload to Firebase Storage via Admin SDK for Vacations
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

    // Get vacation by slug to find ID
    const vacation = await getVacationBySlug(slug, userId);
    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Upload to Firebase Storage via Admin SDK
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `vacations/${vacation.id}/photos/photo-${Date.now()}.${fileExt}`;
    
    const bucket = getAdminStorage().bucket();
    const storageFile = bucket.file(fileName);

    await storageFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // 2. Get the Download URL
    const downloadURL = await getDownloadURL(storageFile);

    // 3. Create the vacation photo record in the database
    const photo = await createVacationPhoto(vacation.id, {
      url: downloadURL,
      caption: file.name,
    });

    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json({ 
      success: true, 
      photoUrl: downloadURL,
      photo
    });
  } catch (error) {
    console.error("Error in server-side vacation gallery upload:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
