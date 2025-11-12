import { NextRequest, NextResponse } from "next/server";
import { getState, formatEntityState, getFriendlyName, isUnavailable } from "@/lib/api/homeassistant";
import { env } from "@/lib/env";

/**
 * GET /api/homeassistant/state/[entityId]
 * Returns a specific entity state from Home Assistant
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    // Check if Home Assistant integration is enabled
    if (!env.ENABLE_HOMEASSISTANT) {
      return NextResponse.json(
        { error: "Home Assistant integration is not enabled" },
        { status: 503 }
      );
    }

    // Check if Home Assistant credentials are configured
    if (!env.HOMEASSISTANT_URL || !env.HOMEASSISTANT_TOKEN) {
      return NextResponse.json(
        { error: "Home Assistant credentials not configured" },
        { status: 500 }
      );
    }

    const { entityId } = await params;

    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }

    const state = await getState(entityId);

    if (!state) {
      return NextResponse.json(
        { error: "Entity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      entityId: state.entity_id,
      state: state.state,
      formattedState: formatEntityState(state),
      friendlyName: getFriendlyName(state),
      unavailable: isUnavailable(state),
      lastUpdated: state.last_updated,
      lastChanged: state.last_changed,
      attributes: state.attributes,
    });
  } catch (error) {
    console.error("Error fetching entity state:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch entity state",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 60; // 1 minute
