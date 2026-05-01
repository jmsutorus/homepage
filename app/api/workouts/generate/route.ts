import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { env } from "@/lib/env";
import { GoogleAuth } from 'google-auth-library';

const googleAuth = new GoogleAuth();

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    
    if (!session) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

    const userId = session.user.id;
    let answers = null;
    try {
      const body = await request.json();
      answers = body.answers;
    } catch {
      // Body might be empty, that's fine
    }
    
    const isProd = process.env.NODE_ENV === "production";
    const baseUrl = isProd && env.FIREBASE_WORKOUT_CURATION_URL 
      ? env.FIREBASE_WORKOUT_CURATION_URL 
      : "http://127.0.0.1:5001/homepage-7cfc8/us-central1/generateWorkoutPlans";
      
    const targetUrl = `${baseUrl}?userId=${userId}`;
    
    console.log(`Executing request targeting: ${targetUrl} with answers:`, answers);

    const headers = new Headers({
      "Content-Type": "application/json",
    });

    // 1. Add Google OIDC Token for Cloud Run IAM protection
    // Only attempt OIDC auth if we're in a Cloud Run environment or production
    const isCloudRun = !!process.env.K_SERVICE;
    if (isProd || isCloudRun) {
      try {
        // baseUrl is the audience
        const client = await googleAuth.getIdTokenClient(baseUrl);
        const authHeaders = await client.getRequestHeaders(targetUrl);
        const authValue = (authHeaders as Record<string, any>)['Authorization'];
        if (authValue) {
          headers.set("Authorization", authValue);
        }
      } catch (err) {
        console.warn("Failed to get Google OIDC token for workout generation:", err);
      }
    }

    // 2. Add Firebase ID Token for app-level authentication
    const firebaseToken = (session.user as any).idToken;
    if (firebaseToken) {
      headers.set("x-firebase-id-token", firebaseToken);
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: response.statusText }, { status: response.status });
    }
    
    const curationDoc = await getAdminFirestore()
      .collection("curations")
      .doc("workouts")
      .collection("users")
      .doc(userId)
      .get();
      
    const data = curationDoc.exists ? curationDoc.data() : null;
    const plan = data?.plan ? {
      ...data.plan,
      updatedAt: data.updatedAt ? (typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate().toISOString() : data.updatedAt) : new Date().toISOString(),
      profileAnswers: data.profileAnswers || null
    } : null;
    
    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.toString() }, { status: 500 });
  }
}
