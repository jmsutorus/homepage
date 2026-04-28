import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireAuthApi } from "@/lib/auth/server";
import { GoogleAuth } from 'google-auth-library';

export async function POST(_request: NextRequest) {
  try {
    const session = await requireAuthApi();
    
    if (!session) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

    const userId = session.user.id;
    // ... existing auth checks ...

    const targetAudience = env.FIREBASE_CURATION_FUNCTION_URL || '';
    
    // 1. Initialize Google Auth (it automatically finds the service account)
    const auth = new GoogleAuth();
    
    // 2. Get a client specifically for this target URL (handles Audience/ID Token)
    const client = await auth.getIdTokenClient(targetAudience);
    
    console.log(`Executing authenticated request targeting: ${targetAudience}`);

    // 3. Use the authorized client to make the request
    // This automatically adds the "Authorization: Bearer <id_token>" header
    const response = await client.request({
      url: `${targetAudience}?userId=${userId}`,
      method: "GET",
    });

    if (response.status !== 200) {
      return NextResponse.json({ error: response.statusText }, { status: response.status });
       // ... handle error ...
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.toString() }, { status: 500 });
    // ... handle error ...
  }
}
/*
function POST(_request: NextRequest) { try { const session = await requireAuthApi(); if (!session) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); } const userId = session.user.id; // Use existing Firebase credentials for Google IAM access const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : undefined; const targetAudience = env.FIREBASE_CURATION_FUNCTION_URL; if (!targetAudience) { console.error("Missing FIREBASE_CURATION_FUNCTION_URL in production environment."); return NextResponse.json( { error: "Configuration Error: FIREBASE_CURATION_FUNCTION_URL is not set in the production environment variables." }, { status: 500 } ); } const client = new JWT({ email: process.env.FIREBASE_CLIENT_EMAIL, key: privateKey, }); console.log(`Fetching ID token for Cloud Run targeting ${targetAudience}`); const idToken = await client.fetchIdToken(targetAudience); console.log(`Executing authenticated request for user ${userId} targeting Cloud Run.`); const url = `${targetAudience}?userId=${userId}`; const response = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${idToken}`, }, }); if (response.status !== 200) { const errorText = await response.text(); console.error(`Cloud Run Error (${response.status}):`, errorText); return NextResponse.json( { error: `Cloud function failed: ${response.statusText}` }, { status: response.status } ); } return NextResponse.json({ success: true }); } catch (error: any) { console.error("Failed proxying curation request:", error); return NextResponse.json( { error: `Proxy Error: ${error.message || "Unknown"}\nStack: ${error.stack || ""}` }, { status: 500 } ); } }
*/
