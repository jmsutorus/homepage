import { NextResponse } from "next/server";
import { getLibraries, getServerInfo } from "@/lib/api/tautulli";
import { env } from "@/lib/env";

/**
 * GET /api/plex/stats
 * Returns Plex server statistics
 */
export async function GET() {
  try {
    // Check if Plex integration is enabled
    if (!env.ENABLE_PLEX) {
      return NextResponse.json(
        { error: "Plex integration is not enabled" },
        { status: 503 }
      );
    }

    // Check if Tautulli credentials are configured
    if (!env.TAUTULLI_URL || !env.TAUTULLI_API_KEY) {
      return NextResponse.json(
        { error: "Tautulli credentials not configured" },
        { status: 500 }
      );
    }

    const [libraries, serverInfo] = await Promise.all([
      getLibraries(),
      getServerInfo(),
    ]);

    const libraryStats = libraries.map((lib) => ({
      name: lib.section_name,
      type: lib.section_type,
      count: lib.count,
      parentCount: lib.parent_count,
      childCount: lib.child_count,
    }));

    return NextResponse.json({
      server: {
        name: serverInfo.pms_name,
        version: serverInfo.pms_version,
        platform: serverInfo.pms_platform,
        webUrl: serverInfo.pms_web_url,
      },
      libraries: libraryStats,
    });
  } catch (error) {
    console.error("Error fetching Plex stats:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Plex stats",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 120; // 2 minutes
