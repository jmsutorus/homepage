import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/server";
import { getParkBySlug, getParkPhotos, createParkPhoto } from "@/lib/db/parks";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await getUserId();
    const { slug } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const park = await getParkBySlug(slug, userId);
    if (!park) {
      return NextResponse.json({ error: "Park not found" }, { status: 404 });
    }

    const photos = await getParkPhotos(park.id);
    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching park photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await getUserId();
    const { slug } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const park = await getParkBySlug(slug, userId);
    if (!park) {
      return NextResponse.json({ error: "Park not found" }, { status: 404 });
    }

    const body = await request.json();
    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const photo = await createParkPhoto(park.id, {
      url: body.url,
      caption: body.caption,
      date_taken: body.date_taken,
      order_index: body.order_index,
    });

    if (!photo) {
      return NextResponse.json({ error: "Failed to create photo" }, { status: 500 });
    }

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Error creating park photo:", error);
    return NextResponse.json(
      { error: "Failed to create photo" },
      { status: 500 }
    );
  }
}
