import { NextRequest, NextResponse } from "next/server";
import {
  updateRelationshipType,
  deleteRelationshipType,
} from "@/lib/db/people";
import { getUserId } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/relationship-types/[id]
 * Updates a relationship type name
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const typeId = parseInt(id, 10);

    if (isNaN(typeId)) {
      return NextResponse.json(
        { error: "Invalid relationship type ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Relationship type name is required" },
        { status: 400 }
      );
    }

    const success = await updateRelationshipType(typeId, name.trim(), userId);

    if (!success) {
      return NextResponse.json(
        { error: "Relationship type not found or not owned by user" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating relationship type:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      return NextResponse.json(
        { error: "A relationship type with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update relationship type" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/relationship-types/[id]
 * Deletes a relationship type
 * People with this type will have their relationship_type_id set to NULL
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const typeId = parseInt(id, 10);

    if (isNaN(typeId)) {
      return NextResponse.json(
        { error: "Invalid relationship type ID" },
        { status: 400 }
      );
    }

    const success = await deleteRelationshipType(typeId, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Relationship type not found or not owned by user" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting relationship type:", error);
    return NextResponse.json(
      { error: "Failed to delete relationship type" },
      { status: 500 }
    );
  }
}
