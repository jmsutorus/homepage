import { NextRequest, NextResponse } from "next/server";
import {
  getScratchPad,
  updateScratchPad,
} from "@/lib/db/scratch-pad";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/scratch-pad
 * Returns the user's scratch pad (creates empty one if doesn't exist)
 */
export async function GET() {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const scratchPad = await getScratchPad(userId);
    return NextResponse.json(scratchPad);
  } catch (error) {
    console.error("Error fetching scratch pad:", error);
    return NextResponse.json(
      { error: "Failed to fetch scratch pad" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/scratch-pad
 * Body: { content: string }
 * Updates the scratch pad content
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { content } = body;

    // Validate input
    if (content === undefined) {
      return NextResponse.json(
        { error: "Missing required field: content" },
        { status: 400 }
      );
    }

    // Validate content length (max 50KB)
    const maxLength = 50000;
    if (content.length > maxLength) {
      return NextResponse.json(
        { error: `Content too long. Maximum length is ${maxLength} characters` },
        { status: 400 }
      );
    }

    // Update scratch pad
    const scratchPad = await updateScratchPad(userId, content);

    return NextResponse.json(scratchPad, { status: 200 });
  } catch (error) {
    console.error("Error updating scratch pad:", error);
    return NextResponse.json(
      { error: "Failed to update scratch pad" },
      { status: 500 }
    );
  }
}
