import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/server";
import { getParkBySlug, updateParkTrail, deleteParkTrail } from "@/lib/db/parks";

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
