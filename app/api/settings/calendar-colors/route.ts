import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getCalendarColors,
  upsertCalendarColor,
  resetAllCalendarColorsToDefaults,
} from "@/lib/db/calendar-colors";

/**
 * GET /api/settings/calendar-colors
 * Get all calendar colors for the current user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const colors = await getCalendarColors(session.user.id);

    return NextResponse.json({ colors });
  } catch (error) {
    console.error("Error fetching calendar colors:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar colors" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/calendar-colors
 * Update calendar colors for the current user
 */
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { colors } = body;

    if (!colors || !Array.isArray(colors)) {
      return NextResponse.json(
        { error: "Colors array is required" },
        { status: 400 }
      );
    }

    // Update each color
    for (const color of colors) {
      if (!color.category || !color.bg_color || !color.text_color) {
        return NextResponse.json(
          { error: "Each color must have category, bg_color, and text_color" },
          { status: 400 }
        );
      }

      upsertCalendarColor(session.user.id, color.category, {
        bg_color: color.bg_color,
        text_color: color.text_color,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Calendar colors updated successfully",
    });
  } catch (error) {
    console.error("Error updating calendar colors:", error);
    return NextResponse.json(
      { error: "Failed to update calendar colors" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/calendar-colors
 * Reset all calendar colors to system defaults
 */
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    resetAllCalendarColorsToDefaults(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Calendar colors reset to defaults",
    });
  } catch (error) {
    console.error("Error resetting calendar colors:", error);
    return NextResponse.json(
      { error: "Failed to reset calendar colors" },
      { status: 500 }
    );
  }
}
