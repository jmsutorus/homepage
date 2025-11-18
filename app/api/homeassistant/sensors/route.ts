import { NextResponse } from "next/server";
import { getMultipleStates, formatEntityState, getFriendlyName, isUnavailable } from "@/lib/api/homeassistant";
import { env } from "@/lib/env";
import haConfig from "@/config/homeassistant.json";

/**
 * GET /api/homeassistant/sensors
 * Returns configured sensor values from Home Assistant
 */
export async function GET() {
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

    // Get entity IDs from config
    const entityIds = haConfig.sensors.map((sensor) => sensor.entityId);

    // Fetch states from Home Assistant
    const states = await getMultipleStates(entityIds);

    // Format sensor data
    const sensors = haConfig.sensors.map((config, index) => {
      const state = states[index];

      return {
        entityId: config.entityId,
        name: config.name,
        icon: config.icon,
        type: config.type || "sensor",
        unit: config.unit,
        state: state ? state.state : "unavailable",
        formattedState: state ? formatEntityState(state) : "Unavailable",
        friendlyName: state ? getFriendlyName(state) : config.name,
        unavailable: isUnavailable(state),
        lastUpdated: state?.last_updated || null,
        attributes: state?.attributes || {},
      };
    });

    return NextResponse.json({
      sensors,
      online: sensors.some((s) => !s.unavailable),
      count: sensors.length,
    });
  } catch (error) {
    console.error("Error fetching Home Assistant sensors:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Home Assistant sensors",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 60; // 1 minute
