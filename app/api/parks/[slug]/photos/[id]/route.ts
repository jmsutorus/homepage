import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/server";
import { getParkBySlug, updateParkPhoto, deleteParkPhoto } from "@/lib/db/parks";

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
    const photoId = parseInt(id, 10);

    const success = await updateParkPhoto(photoId, park.id, {
      url: body.url,
      caption: body.caption,
      date_taken: body.date_taken,
      order_index: body.order_index,
    });

    if (!success) {
      return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating park photo:", error);
    return NextResponse.json(
      { error: "Failed to update photo" },
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

    const photoId = parseInt(id, 10);
    const success = await deleteParkPhoto(photoId, park.id);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting park photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
