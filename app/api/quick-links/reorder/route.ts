import { NextRequest, NextResponse } from "next/server";
import { reorderLinks } from "@/lib/db/quick-links";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * PUT /api/quick-links/reorder
 * Reorder links within a category
 * Body: { categoryId: number, linkIds: number[] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { categoryId, linkIds } = body;

    if (!categoryId || !linkIds || !Array.isArray(linkIds)) {
      return NextResponse.json(
        { error: "Missing required fields: categoryId and linkIds (array)" },
        { status: 400 }
      );
    }

    reorderLinks(userId, categoryId, linkIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering links:", error);
    return NextResponse.json(
      { error: "Failed to reorder links" },
      { status: 500 }
    );
  }
}
