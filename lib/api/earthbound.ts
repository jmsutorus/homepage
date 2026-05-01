import { auth } from "@/auth";
import { env } from "@/lib/env";
import { GoogleAuth } from 'google-auth-library';

const googleAuth = new GoogleAuth();

/**
 * A specialized fetcher for the Earthbound API that automatically
 * injects both a Google OIDC token (for GCP IAM) and the current 
 * user's Firebase ID token (for application-level auth).
 */
export async function earthboundFetch(path: string, options: RequestInit = {}) {
  const baseUrl = env.EARTHBOUND_API_URL || 'https://earthbound-api-xe2v24bjoq-uc.a.run.app';
  if (!baseUrl) {
    throw new Error("EARTHBOUND_API_URL is not defined");
  }

  // Get the current session (Server-side)
  // This works in Server Components, Server Actions, and API Routes
  const session = await auth();
  const firebaseToken = (session?.user as any)?.idToken;

  // Ensure path starts with a slash if it's not a full URL
  const normalizedPath = path.startsWith("/") || path.startsWith("http") ? path : `/${path}`;
  const url = normalizedPath.startsWith("http") ? normalizedPath : `${baseUrl}${normalizedPath}`;

  // Merge headers
  const headers = new Headers(options.headers);

  // 1. Add Google OIDC Token for Cloud Run IAM protection
  // Only attempt OIDC auth if we're in a Cloud Run environment or production
  const isCloudRun = !!process.env.K_SERVICE;
  const isProduction = process.env.NODE_ENV === "production";

  if (isCloudRun || isProduction) {
    try {
      // In many cases, baseUrl is the audience
      const client = await googleAuth.getIdTokenClient(baseUrl);
      const authHeaders = await client.getRequestHeaders(url);
      const authValue = (authHeaders as Record<string, any>)['Authorization'];
      if (authValue) {
        headers.set("Authorization", authValue);
      }
    } catch (err) {
      // Suppress metadata lookup warnings/errors in non-GCP environments
      // and prevent AggregateError from bubbling up
      if (isProduction) {
        console.warn("Failed to get Google OIDC token (this may be expected if not on GCP):", 
          err instanceof Error ? err.message : String(err));
      }
    }
  }

  // 2. Add Firebase ID Token in a custom header for app-level authentication
  // This allows the API to identify the specific user
  if (firebaseToken) {
    headers.set("x-firebase-id-token", firebaseToken);
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
