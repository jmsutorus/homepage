import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireAuthApi } from "@/lib/auth/server";
import { getRelationshipDateById, updateRelationshipDate } from "@/lib/db/relationship";
import { getDownloadURL } from "firebase-admin/storage";
import { revalidatePath } from "next/cache";

/**
 * POST /api/relationship/dates/[id]/photo
 * Handles relationship date photo upload to Firebase Storage via Admin SDK
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
    const dateId = parseInt(id, 10);

    // Get date entry
    const relationshipDate = await getRelationshipDateById(dateId, userId);
    if (!relationshipDate) {
      return NextResponse.json({ error: "Date entry not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Prepare for upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `relationship/dates/${dateId}/photo-${Date.now()}.${fileExt}`;
    
    const bucket = getAdminStorage().bucket();

    // 2. Delete old photo if it exists and is in Firebase Storage
    // Note: The 'photos' field currently stores a single URL string in the UI, 
    // though the DB schema suggests a JSON array. We'll handle it as a single string for now to match UI.
    if (relationshipDate.photos && relationshipDate.photos.includes("firebasestorage.googleapis.com")) {
      try {
        const urlObj = new URL(relationshipDate.photos);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted old date photo from storage: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete old date photo from storage:", err);
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
    await updateRelationshipDate(
      dateId,
      relationshipDate.date,
      relationshipDate.time || undefined,
      relationshipDate.type,
      relationshipDate.location || undefined,
      relationshipDate.venue || undefined,
      relationshipDate.rating || undefined,
      relationshipDate.cost || undefined,
      downloadURL, // Save as single string for now
      relationshipDate.notes || undefined,
      userId
    );

    revalidatePath("/relationship");

    return NextResponse.json({ 
      success: true, 
      photoUrl: downloadURL 
    });
  } catch (error) {
    console.error("Error in server-side relationship date photo upload:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
