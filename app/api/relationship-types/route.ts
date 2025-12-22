import { NextRequest, NextResponse } from "next/server";
import {
  getAllRelationshipTypes,
  createRelationshipType,
  ensureDefaultRelationshipTypes,
} from "@/lib/db/people";
import { getUserId } from "@/lib/auth/server";

/**
 * GET /api/relationship-types
 * Returns all relationship types for the current user
 * Auto-initializes default types if user has none
 */
export async function GET() {
  try {
    const userId = await getUserId();

    // Ensure user has default types if they don't have any
    await ensureDefaultRelationshipTypes(userId);

    const types = await getAllRelationshipTypes(userId);
    return NextResponse.json(types);
  } catch (error) {
    console.error("Error fetching relationship types:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationship types" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/relationship-types
 * Creates a new relationship type
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Relationship type name is required" },
        { status: 400 }
      );
    }

    const type = await createRelationshipType(userId, name.trim());
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    console.error("Error creating relationship type:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      return NextResponse.json(
        { error: "A relationship type with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create relationship type" },
      { status: 500 }
    );
  }
}
