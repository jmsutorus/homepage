
import { NextRequest, NextResponse } from "next/server";
import { renameTag, deleteTag } from "@/lib/db/media";
import { getUserId, requireAuthApi } from "@/lib/auth/server";
// The following two lines were redundant after consolidating imports
// import { requireAuthApi } from "@/lib/auth/server"; // Added import for requireAuthApi
// import { NextRequest } from "next/server"; // Added import for NextRequest

/**
 * PUT /api/media/tags/[name]
 * Rename a tag across all media entries
 */
export async function PUT(
  request: NextRequest, // Changed Request to NextRequest
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    // Replaced getUserId call with requireAuthApi check
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { newName } = body;

    if (!newName || typeof newName !== "string") {
      return NextResponse.json(
        { error: "New name is required" },
        { status: 400 }
      );
    }

    const decodedOldName = decodeURIComponent(name);
    const updatedCount = await renameTag(decodedOldName, newName, userId);

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `Renamed tag "${decodedOldName}" to "${newName}" in ${updatedCount} media item(s)`,
    });
  } catch (error) {
    console.error("Error renaming tag:", error);
    return NextResponse.json(
      { error: "Failed to rename tag" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media/tags/[name]
 * Delete a tag from all media entries
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const decodedName = decodeURIComponent(name);
    const updatedCount = await deleteTag(decodedName, userId);

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `Deleted tag "${decodedName}" from ${updatedCount} media item(s)`,
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
