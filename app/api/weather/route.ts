import { NextRequest, NextResponse } from "next/server";
import { getWeatherForCity } from "@/lib/api/weather";
import { getUserId, requireAuthApi } from "@/lib/auth/server";
import { queryOne } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 1800; // 30 minutes

/**
 * GET /api/weather
 * Returns weather data for the authenticated user's saved location
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Check if weather integration is enabled
    if (!env.ENABLE_WEATHER) {
      return NextResponse.json(
        { error: "Weather integration is not enabled" },
        { status: 503 }
      );
    }

    // Get authenticated user
    // userId is already obtained from session above

    // Get user's saved location
    const user = await queryOne<{ location: string | null }>(
      "SELECT location FROM user WHERE id = ?",
      [userId]
    );

    if (!user || !user.location) {
      return NextResponse.json(
        {
          error: "No location set",
          message:
            "Please set your location in settings or on the widget",
        },
        { status: 404 }
      );
    }

    // Fetch weather data
    const weatherData = await getWeatherForCity(user.location);

    if (!weatherData) {
      return NextResponse.json(
        {
          error: "Failed to fetch weather data",
          message:
            "Could not retrieve weather for your location. Please verify your location is valid.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Error in weather API route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch weather",
      },
      { status: 500 }
    );
  }
}
