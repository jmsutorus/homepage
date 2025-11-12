import { NextResponse } from "next/server";
import {
  getRecentlyPlayedGames,
  getSteamImageUrl,
  formatPlaytime,
} from "@/lib/api/steam";
import { env } from "@/lib/env";

/**
 * GET /api/steam/recent
 * Returns recently played games (last 2 weeks)
 */
export async function GET() {
  try {
    // Check if Steam integration is enabled
    if (!env.ENABLE_STEAM) {
      return NextResponse.json(
        { error: "Steam integration is not enabled" },
        { status: 503 }
      );
    }

    // Check if Steam credentials are configured
    if (!env.STEAM_API_KEY || !env.STEAM_ID) {
      console.error('[Steam API] Missing credentials:', {
        hasApiKey: !!env.STEAM_API_KEY,
        hasSteamId: !!env.STEAM_ID,
      });
      return NextResponse.json(
        { error: "Steam API credentials not configured" },
        { status: 500 }
      );
    }

    console.log('[Steam API] Fetching recent games for Steam ID:', env.STEAM_ID);
    const games = await getRecentlyPlayedGames();

    console.log('[Steam API] Received games count:', games.length);

    const formattedGames = games.map((game) => ({
      appId: game.appid,
      name: game.name,
      playtime2Weeks: game.playtime_2weeks,
      playtime2WeeksFormatted: formatPlaytime(game.playtime_2weeks),
      playtimeForever: game.playtime_forever,
      playtimeForeverFormatted: formatPlaytime(game.playtime_forever),
      iconUrl: getSteamImageUrl(game.appid, game.img_icon_url, "icon"),
      logoUrl: getSteamImageUrl(game.appid, game.img_logo_url, "logo"),
      headerUrl: getSteamImageUrl(game.appid, game.img_icon_url, "header"),
    }));

    return NextResponse.json({
      count: formattedGames.length,
      games: formattedGames,
      steamId: env.STEAM_ID,
      debugInfo: {
        message: formattedGames.length === 0
          ? "No games played in last 2 weeks or profile is private"
          : undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching recently played games:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch recently played games",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes
