import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/server";
import { execute, queryOne } from "@/lib/db";
import { validateLocationFormat } from "@/lib/api/geocoding";
import { getWeatherForCity } from "@/lib/api/weather";

export const dynamic = "force-dynamic";

/**
 * GET /api/weather/location
 * Returns the user's saved location
 */
export async function GET() {
  try {
    const userId = await getUserId();

    const user = await queryOne<{ location: string | null }>(
      "SELECT location FROM user WHERE id = ?",
      [userId]
    );

    return NextResponse.json({
      location: user?.location || null,
    });
  } catch (error) {
    console.error("Error fetching user location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/weather/location
 * Updates the user's location and validates it by fetching weather
 *
 * Body: { location: string } - City name in format "City, ST"
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { location } = body;

    // Validate location format
    if (!location || typeof location !== "string") {
      return NextResponse.json(
        { error: "Location is required and must be a string" },
        { status: 400 }
      );
    }

    const trimmedLocation = location.trim();

    // Validate length
    if (trimmedLocation.length === 0 || trimmedLocation.length > 100) {
      return NextResponse.json(
        {
          error: "Invalid location",
          message: "Location must be between 1 and 100 characters",
        },
        { status: 400 }
      );
    }

    if (!validateLocationFormat(trimmedLocation)) {
      return NextResponse.json(
        {
          error: "Invalid location format",
          message: "Please use format: City, ST (e.g., Denver, CO)",
        },
        { status: 400 }
      );
    }

    // Validate location by attempting to fetch weather
    // This ensures the location is valid and supported by weather.gov
    console.log("Attempting to fetch weather for:", trimmedLocation);
    const testWeather = await getWeatherForCity(trimmedLocation);

    if (!testWeather) {
      console.error("Failed to get weather for location:", trimmedLocation);
      return NextResponse.json(
        {
          error: "Invalid location",
          message:
            "Could not find weather data for this location. Please verify it's a valid US location.",
        },
        { status: 400 }
      );
    }

    console.log("Weather fetched successfully for:", trimmedLocation);

    // Save location to database
    await execute(
      "UPDATE user SET location = ?, updatedAt = ? WHERE id = ?",
      [trimmedLocation, Date.now(), userId]
    );

    return NextResponse.json({
      success: true,
      location: trimmedLocation,
      weather: testWeather, // Return weather data to avoid additional fetch
    });
  } catch (error) {
    console.error("Error updating user location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}
