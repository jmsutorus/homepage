import { NextResponse } from "next/server";
import { renameGenre, deleteGenre } from "@/lib/db/media";

/**
 * PUT /api/media/genres/[name]
 * Rename a genre across all media entries
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
    const updatedCount = renameGenre(decodedOldName, newName);

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `Renamed genre "${decodedOldName}" to "${newName}" in ${updatedCount} media item(s)`,
    });
  } catch (error) {
    console.error("Error renaming genre:", error);
    return NextResponse.json(
      { error: "Failed to rename genre" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media/genres/[name]
 * Delete a genre from all media entries
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    const updatedCount = deleteGenre(decodedName);

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `Deleted genre "${decodedName}" from ${updatedCount} media item(s)`,
    });
  } catch (error) {
    console.error("Error deleting genre:", error);
    return NextResponse.json(
      { error: "Failed to delete genre" },
      { status: 500 }
    );
  }
}
