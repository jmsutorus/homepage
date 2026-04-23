import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireAuthApi } from "@/lib/auth/server";
import { getVacationBySlug, updateVacation } from "@/lib/db/vacations";
import { getDownloadURL } from "firebase-admin/storage";
import { revalidatePath } from "next/cache";

/**
 * POST /api/vacations/[slug]/photo
 * Handles main poster upload to Firebase Storage via Admin SDK
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
    const fileName = `vacations/${vacation.id}/poster-${Date.now()}.${fileExt}`;
    
    const bucket = getAdminStorage().bucket();

    // 0. Delete old photo if it exists and is in Firebase Storage
    if (vacation.poster && vacation.poster.includes("firebasestorage.googleapis.com")) {
      try {
        const urlObj = new URL(vacation.poster);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted old poster from storage: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete old poster from storage:", err);
      }
    }

    const storageFile = bucket.file(fileName);

    await storageFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // 2. Get the Download URL
    const downloadURL = await getDownloadURL(storageFile);

    // 3. Update the vacation in the database
    await updateVacation(vacation.id, userId, {
      poster: downloadURL
    });

    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json({ 
      success: true, 
      photoUrl: downloadURL 
    });
  } catch (error) {
    console.error("Error in server-side vacation poster upload:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
