import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireAuthApi } from "@/lib/auth/server";
import { getPersonById, updatePerson } from "@/lib/db/people";
import { getDownloadURL } from "firebase-admin/storage";
import { convertToWebP } from "@/lib/services/image-processor";

/**
 * POST /api/people/[id]/photo
 * Handles file upload to Firebase Storage via Admin SDK
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
    const personId = parseInt(id, 10);

    if (isNaN(personId)) {
      return NextResponse.json({ error: "Invalid person ID" }, { status: 400 });
    }

    // Check if person exists and belongs to user
    const person = await getPersonById(personId, userId);
    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Upload to Firebase Storage via Admin SDK
    const { buffer, fileName: convertedFileName, contentType } = await convertToWebP(file);
    const fileExt = convertedFileName.split('.').pop();
    const fileName = `people/${personId}/photo-${Date.now()}.${fileExt}`;
    
    const bucket = getAdminStorage().bucket();
    const storageFile = bucket.file(fileName);

    await storageFile.save(buffer, {
      metadata: {
        contentType: contentType,
      },
    });

    // 2. Get the Download URL
    const downloadURL = await getDownloadURL(storageFile);

    // 3. Update the database
    const success = await updatePerson(
      person.id,
      person.name,
      person.birthday,
      person.relationship as any,
      downloadURL,
      person.email || undefined,
      person.phone || undefined,
      person.notes || undefined,
      person.gift_ideas || undefined,
      person.anniversary || undefined,
      userId,
      person.relationship_type_id || undefined,
      person.is_partner || false,
      person.slug,
      person.address || undefined
    );

    if (!success) {
      return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      photoUrl: downloadURL 
    });
  } catch (error) {
    console.error("Error in server-side photo upload:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
