import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { JWT } from "google-auth-library";
import { env } from "@/lib/env";

export async function POST(_request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Use existing Firebase credentials for Google IAM access
    const privateKey = process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") 
      : undefined;

    const targetAudience = env.FIREBASE_CURATION_FUNCTION_URL;
    if (!targetAudience) {
      console.error("Missing FIREBASE_CURATION_FUNCTION_URL in production environment.");
      return NextResponse.json(
        { error: "Configuration Error: FIREBASE_CURATION_FUNCTION_URL is not set in the production environment variables." },
        { status: 500 }
      );
    }

    const client = new JWT({
      email: process.env.FIREBASE_CLIENT_EMAIL,
      key: privateKey,
    });

    console.log(`Fetching ID token for Cloud Run targeting ${targetAudience}`);
    const idToken = await client.fetchIdToken(targetAudience);

    console.log(`Executing authenticated request for user ${userId} targeting Cloud Run.`);

    const url = `${targetAudience}?userId=${userId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (response.status !== 200) {
      const errorText = await response.text();
      console.error(`Cloud Run Error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `Cloud function failed: ${response.statusText}` }, 
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed proxying curation request:", error);
    return NextResponse.json(
      { error: `Proxy Error: ${error.message || "Unknown"}\nStack: ${error.stack || ""}` }, 
      { status: 500 }
    );
  }
}
