import { NextResponse } from "next/server";
import { getRecentlyAdded, getPlexImageUrl, formatMediaType } from "@/lib/api/tautulli";
import { env } from "@/lib/env";

/**
 * GET /api/plex/recent
 * Returns recently added media to Plex
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

    const data = await getRecentlyAdded(10);

    const recentMedia = data.recently_added.map((item) => ({
      title: item.title,
      grandparentTitle: item.grandparent_title,
      year: item.year,
      mediaType: formatMediaType(item.media_type),
      addedAt: item.added_at,
      thumb: getPlexImageUrl(item.thumb, 300, 450),
      ratingKey: item.rating_key,
    }));

    return NextResponse.json({
      count: recentMedia.length,
      media: recentMedia,
    });
  } catch (error) {
    console.error("Error fetching recently added media:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch recently added media",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 120; // 2 minutes
