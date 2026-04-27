import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { recordLoginState } from "@/lib/services/user-activity";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // Attempt to extract country from standard edge deployment headers
    let country = body.country;
    if (!country) {
      country = req.headers.get("x-vercel-ip-country") || 
                req.headers.get("cf-ipcountry") || 
                "US";
    }

    await recordLoginState(session.user.id, {
      country,
      timezone: body.timezone || "UTC",
      preferredLanguage: body.preferredLanguage || "en",
      isLogin: body.isLogin ?? false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user activity state:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
