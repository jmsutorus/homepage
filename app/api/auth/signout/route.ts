import { NextResponse } from "next/server";
import { signOut } from "@/auth";

/**
 * POST /api/auth/signout
 * Sign out the current user from both NextAuth session and Firebase
 */
export async function POST() {
  try {
    // Sign out using NextAuth
    // This clears the session cookie
    await signOut({
      redirect: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
