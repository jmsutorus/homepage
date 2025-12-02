import { requireAuth } from "@/lib/auth/server";
import { execute, query } from "@/lib/db";
import { NextResponse } from "next/server";
import { ACHIEVEMENTS } from "@/lib/achievements";

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Get unnotified unlocked achievements
    const rows = await query<{ achievementId: string }>(
      `SELECT achievementId FROM user_achievements
       WHERE userId = ? AND unlocked = 1 AND notified = 0`,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ notifications: [] });
    }

    // Mark them as notified
    const achievementIds = rows.map(r => r.achievementId);
    const placeholders = achievementIds.map(() => "?").join(",");

    await execute(
      `UPDATE user_achievements
       SET notified = 1
       WHERE userId = ? AND achievementId IN (${placeholders})`,
      [userId, ...achievementIds]
    );

    // Return the full achievement details
    const notifications = rows.map(row => {
      const achievement = ACHIEVEMENTS.find(a => a.id === row.achievementId);
      return achievement;
    }).filter(Boolean);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error checking achievement notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
