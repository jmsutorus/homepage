import { NextResponse } from "next/server";
import { getAllUniqueGenres } from "@/lib/db/media";

/**
 * GET /api/media/genres
 * Get all unique genres across all media
 */
export async function GET() {
  try {
    const genres = getAllUniqueGenres();
    return NextResponse.json({ genres });
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 }
    );
  }
}
