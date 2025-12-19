import { NextResponse } from "next/server";
import { getRelationshipStats } from "@/lib/db/relationship";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/relationship/stats
 * Returns comprehensive relationship statistics
 */
export async function GET() {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const stats = await getRelationshipStats(userId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching relationship stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationship stats" },
      { status: 500 }
    );
  }
}
