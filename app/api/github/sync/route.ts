import { NextRequest, NextResponse } from "next/server";
import { syncGithubData } from "@/lib/services/github-sync";
import { requireAuthApi } from "@/lib/auth/server";
import { queryOne } from "@/lib/db";

/**
 * POST /api/github/sync
 * Body: { full?: boolean }
 * Sync GitHub events to database
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json().catch(() => ({}));
    const { full = false } = body;

    // Get the user's GitHub access token from their linked account
    const account = await queryOne<{ accessToken: string }>(
      "SELECT accessToken FROM account WHERE userId = ? AND providerId = 'github'",
      [userId]
    );

    if (!account?.accessToken) {
      return NextResponse.json(
        { error: "No GitHub account linked. Please connect your GitHub account." },
        { status: 400 }
      );
    }

    const result = await syncGithubData(account.accessToken, userId, full);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Sync failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      eventsSynced: result.eventsSynced,
    });
  } catch (error) {
    console.error("Error in GitHub sync API:", error);
    return NextResponse.json(
      { error: "Failed to sync GitHub data" },
      { status: 500 }
    );
  }
}
