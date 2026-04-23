import { NextRequest, NextResponse } from "next/server";
import {
  getEventBySlug,
  getEventPhotos,
  createEventPhoto,
  deleteEventPhoto,
  type EventPhotoInput,
} from "@/lib/db/events";
import { requireAuthApi } from "@/lib/auth/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/events/[slug]/photos
 * Get all photos for an event
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { slug } = await params;

    // Get event by slug to find ID
    const event = await getEventBySlug(slug, userId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const photos = await getEventPhotos(event.id);
    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching event photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch event photos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/[slug]/photos
 * Create a new photo for an event
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { slug } = await params;
    const body = await request.json();

    // Get event by slug to find ID
    const event = await getEventBySlug(slug, userId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Validate required fields
    if (!body.url) {
      return NextResponse.json(
        { error: "Missing required field: url" },
        { status: 400 }
      );
    }

    const input: EventPhotoInput = {
      url: body.url,
      caption: body.caption,
      date_taken: body.date_taken,
      order_index: body.order_index,
    };

    // If this is becoming the new hero (order_index 0), clean up the old one
    if (input.order_index === 0) {
      try {
        const photos = await getEventPhotos(event.id);
        const oldHero = photos.find(p => p.order_index === 0);
        
        if (oldHero) {
          // Delete from Storage if it's a Firebase URL
          if (oldHero.url.includes("firebasestorage.googleapis.com")) {
            try {
              const bucket = getAdminStorage().bucket();
              const urlObj = new URL(oldHero.url);
              const pathPart = urlObj.pathname.split("/o/")[1];
              if (pathPart) {
                const filePath = decodeURIComponent(pathPart);
                const oldFile = bucket.file(filePath);
                const [exists] = await oldFile.exists();
                if (exists) {
                  await oldFile.delete();
                  console.log(`Deleted old event hero during URL update: ${filePath}`);
                }
              }
            } catch (storageErr) {
              console.error("Failed to delete old hero from storage:", storageErr);
            }
          }
          // Delete from DB
          await deleteEventPhoto(oldHero.id, event.id);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up old event hero during URL update:", cleanupError);
      }
    }

    const photo = await createEventPhoto(event.id, input);
    revalidatePath(`/events/${slug}`);
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Error creating event photo:", error);
    return NextResponse.json(
      { error: "Failed to create event photo" },
      { status: 500 }
    );
  }
}
