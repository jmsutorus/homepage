import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { execute, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings/birthday
 * Returns the user's saved birthday
 */
export async function GET() {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const user = await queryOne<{ birthday: string | null }>(
      "SELECT birthday FROM user WHERE id = ?",
      [userId]
    );

    return NextResponse.json({
      birthday: user?.birthday || null,
    });
  } catch (error) {
    console.error("Error fetching user birthday:", error);
    return NextResponse.json(
      { error: "Failed to fetch birthday" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/birthday
 * Updates the user's birthday
 *
 * Body: { birthday: string } - Date in YYYY-MM-DD format
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { birthday } = body;

    // Validate birthday is provided
    if (!birthday || typeof birthday !== "string") {
      return NextResponse.json(
        { error: "Birthday is required and must be a string" },
        { status: 400 }
      );
    }

    const trimmedBirthday = birthday.trim();

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(trimmedBirthday)) {
      return NextResponse.json(
        {
          error: "Invalid date format",
          message: "Birthday must be in YYYY-MM-DD format",
        },
        { status: 400 }
      );
    }

    // Validate it's a valid date
    const birthdayDate = new Date(trimmedBirthday);
    if (isNaN(birthdayDate.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid date",
          message: "Please enter a valid date",
        },
        { status: 400 }
      );
    }

    // Validate birthday is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birthdayDate >= today) {
      return NextResponse.json(
        {
          error: "Invalid date",
          message: "Birthday must be in the past",
        },
        { status: 400 }
      );
    }

    // Validate reasonable age limits (not before 1875, max 150 years old)
    const minDate = new Date("1875-01-01");
    if (birthdayDate < minDate) {
      return NextResponse.json(
        {
          error: "Invalid date",
          message: "Birthday must be after January 1, 1875",
        },
        { status: 400 }
      );
    }

    // Save birthday to database
    await execute(
      "UPDATE user SET birthday = ?, updatedAt = ? WHERE id = ?",
      [trimmedBirthday, Date.now(), userId]
    );

    return NextResponse.json({
      success: true,
      birthday: trimmedBirthday,
    });
  } catch (error) {
    console.error("Error updating user birthday:", error);
    return NextResponse.json(
      { error: "Failed to update birthday" },
      { status: 500 }
    );
  }
}
