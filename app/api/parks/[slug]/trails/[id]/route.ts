import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/server";
import { getParkBySlug, updateParkTrail, deleteParkTrail, getParkTrail } from "@/lib/db/parks";
import { getAdminStorage } from "@/lib/firebase/admin";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const userId = await getUserId();
    const { slug, id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const park = await getParkBySlug(slug, userId);
    if (!park) {
      return NextResponse.json({ error: "Park not found" }, { status: 404 });
    }

    const body = await request.json();
    const trailId = parseInt(id, 10);

    // Handle photo cleanup if photo_url is being updated
    if (body.photo_url !== undefined) {
      const existingTrail = await getParkTrail(trailId, park.id);
      if (existingTrail && existingTrail.photo_url && existingTrail.photo_url !== body.photo_url) {
        if (existingTrail.photo_url.includes("firebasestorage.googleapis.com")) {
          try {
            const bucket = getAdminStorage().bucket();
            const urlObj = new URL(existingTrail.photo_url);
            const pathPart = urlObj.pathname.split("/o/")[1];
            if (pathPart) {
              const filePath = decodeURIComponent(pathPart);
              const oldFile = bucket.file(filePath);
              const [exists] = await oldFile.exists();
              if (exists) {
                await oldFile.delete();
                console.log(`Deleted old trail photo during PUT: ${filePath}`);
              }
            }
          } catch (err) {
            console.error("Failed to delete old trail photo during PUT:", err);
          }
        }
      }
    }

    const success = await updateParkTrail(trailId, park.id, {
      name: body.name,
      distance: body.distance,
      elevation_gain: body.elevation_gain,
      difficulty: body.difficulty,
      rating: body.rating,
      date_hiked: body.date_hiked,
      notes: body.notes,
      alltrails_url: body.alltrails_url,
      photo_url: body.photo_url,
    });

    if (!success) {
      return NextResponse.json({ error: "Failed to update trail" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating park trail:", error);
    return NextResponse.json(
      { error: "Failed to update trail" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const userId = await getUserId();
    const { slug, id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const park = await getParkBySlug(slug, userId);
    if (!park) {
      return NextResponse.json({ error: "Park not found" }, { status: 404 });
    }

    const trailId = parseInt(id, 10);
    const existingTrail = await getParkTrail(trailId, park.id);

    // Delete from Storage if it exists
    if (existingTrail && existingTrail.photo_url && existingTrail.photo_url.includes("firebasestorage.googleapis.com")) {
      try {
        const bucket = getAdminStorage().bucket();
        const urlObj = new URL(existingTrail.photo_url);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted trail photo during DELETE: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete trail photo from storage:", err);
      }
    }

    const success = await deleteParkTrail(trailId, park.id);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete trail" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting park trail:", error);
    return NextResponse.json(
      { error: "Failed to delete trail" },
      { status: 500 }
    );
  }
}
