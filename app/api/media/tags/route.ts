import { NextRequest, NextResponse } from "next/server";
import { getAllUniqueTags } from "@/lib/db/media";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/media/tags
 * Get all unique tags across all media
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const tags = await getAllUniqueTags(userId);
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
