import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";

/**
 * Custom endpoint to exchange Firebase ID token for Auth.js session
 * This is called after successful Firebase authentication on the client
 */
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing ID token" },
        { status: 400 }
      );
    }

    // Sign in using the Credentials provider with Firebase token
    await signIn("credentials", {
      idToken,
      redirect: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Firebase session error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
