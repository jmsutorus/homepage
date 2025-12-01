import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCalendarDataForDate } from "@/lib/db/calendar";
import { getGithubActivity, type GithubEvent } from "@/lib/github";
import { queryOne } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Date parameter is required" },
      { status: 400 }
    );
  }

  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Invalid date format. Expected YYYY-MM-DD" },
      { status: 400 }
    );
  }

  try {
    // Fetch GitHub events if user is authenticated and has linked account
    const session = await auth();
    let githubEvents: GithubEvent[] = [];

    if (session?.user?.id) {
      const account = await queryOne<{ accessToken: string }>(
        "SELECT accessToken FROM account WHERE userId = ? AND providerId = 'github'",
        [session.user.id]
      );

      if (account?.accessToken) {
        // Fetch GitHub events for the specific date
        githubEvents = await getGithubActivity(
          account.accessToken,
          date,
          date
        );
      }
    }

    const dayData = await getCalendarDataForDate(date, githubEvents);

    if (!dayData) {
      return NextResponse.json(
        { error: "No data found for date" },
        { status: 404 }
      );
    }

    return NextResponse.json(dayData);
  } catch (error) {
    console.error("Error fetching calendar day data:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar day data" },
      { status: 500 }
    );
  }
}
