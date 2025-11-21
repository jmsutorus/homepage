"use server";

import { auth } from "@/auth";
import { cookies } from "next/headers";

export interface StravaSession {
  userId: string;
  athleteId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export async function getStravaSession(): Promise<StravaSession | null> {
  try {
    // Get session token from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      return null;
    }

    // Query the session and user from database
    const db = (auth as any).options.database;

    const session = db
      .prepare(
        `SELECT userId FROM session WHERE token = ? AND expiresAt > ?`
      )
      .get(sessionToken, Date.now());

    if (!session) {
      return null;
    }

    // Get the Strava account for this user
    const account = db
      .prepare(
        `SELECT accountId, accessToken, refreshToken, accessTokenExpiresAt
         FROM account
         WHERE userId = ? AND providerId = ?`
      )
      .get(session.userId, "strava");

    if (!account) {
      return null;
    }

    return {
      userId: session.userId,
      athleteId: account.accountId,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      expiresAt: account.accessTokenExpiresAt,
    };
  } catch (error) {
    console.error("Error getting Strava session:", error);
    return null;
  }
}
