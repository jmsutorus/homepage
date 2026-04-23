import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireAuthApi } from "@/lib/auth/server";
import { getMealById, updateMeal } from "@/lib/db/meals";
import { getDownloadURL } from "firebase-admin/storage";

/**
 * POST /api/meals/[id]/photo
 * Handles file upload to Firebase Storage via Admin SDK for Meals
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
    const mealId = parseInt(id, 10);

    if (isNaN(mealId)) {
      return NextResponse.json({ error: "Invalid meal ID" }, { status: 400 });
    }

    // Check if meal exists and belongs to user
    const meal = await getMealById(mealId, userId);
    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Upload to Firebase Storage via Admin SDK
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `meals/${mealId}/photo-${Date.now()}.${fileExt}`;
    
    const bucket = getAdminStorage().bucket();

    // 0. Delete old photo if it exists and is in Firebase Storage
    if (meal.image_url && meal.image_url.includes("firebasestorage.googleapis.com")) {
      try {
        const urlObj = new URL(meal.image_url);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted old meal photo from storage: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete old meal photo from storage:", err);
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

    // 3. Update the database
    const success = await updateMeal(mealId, userId, {
      image_url: downloadURL
    });

    if (!success) {
      return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      photoUrl: downloadURL 
    });
  } catch (error) {
    console.error("Error in server-side meal photo upload:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
