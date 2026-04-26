import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { adminDb } from "@/lib/firebase/admin";
import crypto from "crypto";

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing required query parameter: token" },
        { status: 400 }
      );
    }

    // Hash the token to find the document ID
    const tokenId = crypto.createHash("sha256").update(token).digest("hex");

    await adminDb
      .collection("fcm_tokens")
      .doc(userId)
      .collection("tokens")
      .doc(tokenId)
      .delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error unregistering FCM token:", error);
    return NextResponse.json(
      { error: "Failed to unregister FCM token" },
      { status: 500 }
    );
  }
}
