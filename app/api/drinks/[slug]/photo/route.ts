import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireAuthApi } from "@/lib/auth/server";
import { getDrinkBySlug, updateDrink } from "@/lib/db/drinks";
import { getDownloadURL } from "firebase-admin/storage";
import { revalidatePath } from "next/cache";
import { convertToWebP } from "@/lib/services/image-processor";

/**
 * POST /api/drinks/[slug]/photo
 * Handles drink photo upload to Firebase Storage via Admin SDK
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

    // Get drink by slug to find ID
    const drink = await getDrinkBySlug(slug, userId);
    if (!drink) {
      return NextResponse.json({ error: "Drink not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Prepare for upload
    const { buffer, fileName: convertedFileName, contentType } = await convertToWebP(file);
    const fileExt = convertedFileName.split('.').pop();
    const fileName = `drinks/${drink.id}/photo-${Date.now()}.${fileExt}`;
    
    const bucket = getAdminStorage().bucket();

    // 2. Delete old photo if it exists and is in Firebase Storage
    if (drink.image_url && drink.image_url.includes("firebasestorage.googleapis.com")) {
      try {
        const urlObj = new URL(drink.image_url);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted old drink photo from storage: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete old drink photo from storage:", err);
      }
    }

    // 3. Upload new photo
    const storageFile = bucket.file(fileName);
    await storageFile.save(buffer, {
      metadata: {
        contentType: contentType,
      },
    });

    // 4. Get the Download URL
    const downloadURL = await getDownloadURL(storageFile);

    // 5. Update the database
    await updateDrink(slug, userId, {
      image_url: downloadURL
    });

    revalidatePath(`/drinks/${slug}`);

    return NextResponse.json({ 
      success: true, 
      photoUrl: downloadURL 
    });
  } catch (error) {
    console.error("Error in server-side drink photo upload:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
