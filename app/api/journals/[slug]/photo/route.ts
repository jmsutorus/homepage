import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireAuthApi } from "@/lib/auth/server";
import { getJournalBySlug, updateJournal } from "@/lib/db/journals";
import { getDownloadURL } from "firebase-admin/storage";
import { revalidatePath } from "next/cache";

/**
 * POST /api/journals/[slug]/photo
 * Handles journal image upload to Firebase Storage via Admin SDK
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

    // Get journal by slug
    const journal = await getJournalBySlug(slug, userId);
    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Prepare for upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `journals/${journal.id}/image-${Date.now()}.${fileExt}`;
    
    const bucket = getAdminStorage().bucket();

    // 2. Delete old photo if it exists and is in Firebase Storage
    if (journal.image_url && journal.image_url.includes("firebasestorage.googleapis.com")) {
      try {
        const urlObj = new URL(journal.image_url);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted old journal image from storage: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete old journal image from storage:", err);
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
    await updateJournal(slug, userId, {
      image_url: downloadURL
    });

    revalidatePath(`/journals/${slug}`);

    return NextResponse.json({ 
      success: true, 
      photoUrl: downloadURL 
    });
  } catch (error) {
    console.error("Error in server-side journal image upload:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
