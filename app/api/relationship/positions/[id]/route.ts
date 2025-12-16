import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { deletePosition } from "@/lib/db/relationship";

/**
 * DELETE /api/relationship/positions/[id]
 * Delete a custom position (cannot delete defaults)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuthApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;
  const positionId = parseInt(id);

  if (isNaN(positionId)) {
    return NextResponse.json({ error: "Invalid position ID" }, { status: 400 });
  }

  try {
    const deleted = await deletePosition(positionId, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Position not found or cannot be deleted (default positions cannot be deleted)" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting position:", error);
    return NextResponse.json(
      { error: "Failed to delete position" },
      { status: 500 }
    );
  }
}
