import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { token, platform, userAgent } = body;

    if (!token || !platform) {
      return NextResponse.json(
        { error: "Missing required fields: token and platform" },
        { status: 400 }
      );
    }

    if (!['web', 'android', 'ios'].includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform. Must be 'web', 'android', or 'ios'" },
        { status: 400 }
      );
    }

    // Hash the token to use as a safe Firestore document ID
    const tokenId = crypto.createHash("sha256").update(token).digest("hex");

    const tokenDocRef = adminDb
      .collection("fcm_tokens")
      .doc(userId)
      .collection("tokens")
      .doc(tokenId);

    const docSnapshot = await tokenDocRef.get();

    if (docSnapshot.exists) {
      // Update existing token record
      await tokenDocRef.update({
        platform,
        userAgent: userAgent || request.headers.get("user-agent") || null,
        updatedAt: Timestamp.now(),
      });
    } else {
      // Create new token record
      await tokenDocRef.set({
        token,
        platform,
        userAgent: userAgent || request.headers.get("user-agent") || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error registering FCM token:", error);
    return NextResponse.json(
      { error: "Failed to register FCM token" },
      { status: 500 }
    );
  }
}
