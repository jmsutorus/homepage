import { NextResponse } from "next/server";
import { getPlayerSummary, isInGame, getPersonaState } from "@/lib/api/steam";
import { env } from "@/lib/env";

/**
 * GET /api/steam/status
 * Returns current Steam player status (online/offline, currently playing game)
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
      return NextResponse.json(
        { error: "Steam API credentials not configured" },
        { status: 500 }
      );
    }

    const player = await getPlayerSummary();

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      steamId: player.steamid,
      personaName: player.personaname,
      avatarUrl: player.avatarfull,
      profileUrl: player.profileurl,
      personaState: player.personastate,
      personaStateText: getPersonaState(player.personastate),
      isOnline: player.personastate !== 0,
      isInGame: isInGame(player),
      currentGame: player.gameextrainfo || null,
      currentGameId: player.gameid || null,
      lastLogoff: player.lastlogoff || null,
    });
  } catch (error) {
    console.error("Error fetching Steam status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch Steam status",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes
