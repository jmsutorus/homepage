import { NextResponse } from "next/server";
import { renameTag, deleteTag } from "@/lib/db/media";

/**
 * PUT /api/media/tags/[name]
 * Rename a tag across all media entries
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json();
    const { newName } = body;

    if (!newName || typeof newName !== "string") {
      return NextResponse.json(
        { error: "New name is required" },
        { status: 400 }
      );
    }

    const decodedOldName = decodeURIComponent(name);
    const updatedCount = renameTag(decodedOldName, newName);

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
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    const updatedCount = deleteTag(decodedName);

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
