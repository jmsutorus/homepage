import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { getPositions, createPosition, ensureDefaultPositions } from "@/lib/db/relationship";

/**
 * GET /api/relationship/positions
 * Get all positions for the authenticated user
 */
export async function GET() {
  const session = await requireAuthApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Ensure default positions exist for the user
    await ensureDefaultPositions(userId);

    // Get all positions
    const positions = await getPositions(userId);

    return NextResponse.json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/relationship/positions
 * Create a new custom position
 */
export async function POST(request: NextRequest) {
  const session = await requireAuthApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Position name is required" },
        { status: 400 }
      );
    }

    if (name.trim().length === 0) {
      return NextResponse.json(
        { error: "Position name cannot be empty" },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: "Position name must be 50 characters or less" },
        { status: 400 }
      );
    }

    const position = await createPosition(name.trim(), userId);

    return NextResponse.json(position, { status: 201 });
  } catch (error: any) {
    console.error("Error creating position:", error);

    // Handle unique constraint violation (duplicate position name)
    if (error.message && error.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "A position with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create position" },
      { status: 500 }
    );
  }
}
