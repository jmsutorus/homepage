import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/server";
import { getParkBySlug, getParkTrails, createParkTrail } from "@/lib/db/parks";

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

    const trails = await getParkTrails(park.id);
    return NextResponse.json(trails);
  } catch (error) {
    console.error("Error fetching park trails:", error);
    return NextResponse.json(
      { error: "Failed to fetch trails" },
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
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const trail = await createParkTrail(park.id, {
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

    if (!trail) {
      return NextResponse.json({ error: "Failed to create trail" }, { status: 500 });
    }

    return NextResponse.json(trail, { status: 201 });
  } catch (error) {
    console.error("Error creating park trail:", error);
    return NextResponse.json(
      { error: "Failed to create trail" },
      { status: 500 }
    );
  }
}
