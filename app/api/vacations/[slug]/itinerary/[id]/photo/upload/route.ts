import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireAuthApi } from "@/lib/auth/server";
import { getVacationBySlug, getItineraryDay, updateItineraryDay } from "@/lib/db/vacations";
import { getDownloadURL } from "firebase-admin/storage";
import { revalidatePath } from "next/cache";
import { deleteFromStorage } from "@/lib/firebase/storage-utils";

/**
 * POST /api/vacations/[slug]/itinerary/[id]/photo/upload
 * Handles itinerary day photo upload to Firebase Storage
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
    const { slug, id: dayIdStr } = await params;
    const dayId = parseInt(dayIdStr);

    // Get vacation by slug to find ID
    const vacation = await getVacationBySlug(slug, userId);
    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    // Get itinerary day
    const day = await getItineraryDay(dayId, vacation.id);
    if (!day) {
      return NextResponse.json({ error: "Itinerary day not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Cleanup existing photo if it exists
    if (day.photo) {
      await deleteFromStorage(day.photo);
    }

    // 2. Upload to Firebase Storage via Admin SDK
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `vacations/${vacation.id}/itinerary/${day.id}/photo-${Date.now()}.${fileExt}`;
    
    const bucket = getAdminStorage().bucket();
    const storageFile = bucket.file(fileName);

    await storageFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // 3. Get the Download URL
    const downloadURL = await getDownloadURL(storageFile);

    // 4. Update the itinerary day record in the database
    await updateItineraryDay(day.id, vacation.id, {
      photo: downloadURL,
    });

    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json({ 
      success: true, 
      photoUrl: downloadURL
    });
  } catch (error) {
    console.error("Error in server-side itinerary photo upload:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
