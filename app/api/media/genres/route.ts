import { NextRequest, NextResponse } from "next/server";
import { getAllUniqueGenres } from "@/lib/db/media";
import { getUserId, requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/media/genres
 * Get all unique genres across all media
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const genres = await getAllUniqueGenres(userId);
    return NextResponse.json({ genres });
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 }
    );
  }
}
