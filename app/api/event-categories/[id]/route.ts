import { NextRequest, NextResponse } from "next/server";
import {
  renameEventCategory,
  deleteEventCategory,
} from "@/lib/db/events";
import { getUserId } from "@/lib/auth/server";

/**
 * PATCH /api/event-categories/:id
 * Renames an event category
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const success = await renameEventCategory(categoryId, userId, name.trim());

    if (!success) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating event category:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update event category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/event-categories/:id
 * Deletes an event category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const success = await deleteEventCategory(categoryId, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event category:", error);
    return NextResponse.json(
      { error: "Failed to delete event category" },
      { status: 500 }
    );
  }
}
