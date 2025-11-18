import { NextResponse } from "next/server";
import { getActivity, formatProgress, getQualityColor } from "@/lib/api/tautulli";
import { env } from "@/lib/env";

/**
 * GET /api/plex/activity
 * Returns current Plex streams
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

    const activity = await getActivity();

    const streams = activity.sessions.map((session) => ({
      sessionKey: session.session_key,
      user: session.user,
      player: session.player,
      platform: session.platform,
      mediaType: session.media_type,
      title: session.title,
      grandparentTitle: session.grandparent_title,
      year: session.year,
      thumb: session.thumb,
      state: session.state,
      progress: formatProgress(session.view_offset, session.duration),
      resolution: session.stream_video_resolution,
      qualityColor: getQualityColor(session.stream_video_resolution),
      container: session.stream_container,
    }));

    return NextResponse.json({
      streamCount: activity.stream_count,
      streams,
      isOnline: true,
    });
  } catch (error) {
    console.error("Error fetching Plex activity:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Plex activity",
        isOnline: false,
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 120; // 2 minutes
