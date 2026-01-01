import { NextRequest, NextResponse } from "next/server";
import { updateLog, deleteLog } from "@/lib/db/drinks";
import { getUserId } from "@/lib/auth/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    const userId = await getUserId();
    const body = await req.json();

    const updated = await updateLog(id, userId, {
      notes: body.notes,
      rating: body.rating ? parseInt(body.rating) : undefined,
      date: body.date,
      location: body.location,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating drink log:", error);
    return NextResponse.json(
      { error: "Failed to update drink log" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    const userId = await getUserId();

    const success = await deleteLog(id, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting drink log:", error);
    return NextResponse.json(
      { error: "Failed to delete drink log" },
      { status: 500 }
    );
  }
}
