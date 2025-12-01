import { NextResponse } from "next/server";
import { getAllUniqueTags } from "@/lib/db/media";
import { getUserId } from "@/lib/auth/server";

/**
 * GET /api/media/tags
 * Get all unique tags across all media
 */
export async function GET() {
  try {
    const userId = await getUserId();
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
