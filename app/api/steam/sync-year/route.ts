import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { syncYearlySteamData } from "@/lib/data/yearly-data";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { year } = body;

    if (!year || typeof year !== 'number') {
      return NextResponse.json(
        { error: "Valid year parameter is required" },
        { status: 400 }
      );
    }

    // Sync Steam data for the specified year
    await syncYearlySteamData(session.user.id, year);

    return NextResponse.json({
      success: true,
      message: `Steam data synced successfully for year ${year}`,
    });
  } catch (error) {
    console.error("Steam sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Steam data" },
      { status: 500 }
    );
  }
}
