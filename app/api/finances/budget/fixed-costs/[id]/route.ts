import { NextRequest, NextResponse } from "next/server";
import { updateFixedCost, deleteFixedCost } from "@/lib/db/budget";
import { getUserId } from "@/lib/auth/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const body = await req.json();

    const updated = await updateFixedCost(parseInt(id), userId, {
      name: body.name,
      category: body.category,
      amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
      currency: body.currency,
      notes: body.notes,
    });

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating fixed cost:", error);
    return NextResponse.json({ error: "Failed to update fixed cost" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const deleted = await deleteFixedCost(parseInt(id), userId);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fixed cost:", error);
    return NextResponse.json({ error: "Failed to delete fixed cost" }, { status: 500 });
  }
}
