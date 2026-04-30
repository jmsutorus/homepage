import { auth } from "@/auth";
import { env } from "@/lib/env";

/**
 * A specialized fetcher for the Earthbound API that automatically
 * injects the current user's Firebase ID token.
 */
export async function earthboundFetch(path: string, options: RequestInit = {}) {
  const baseUrl = env.EARTHBOUND_API_URL;
  if (!baseUrl) {
    throw new Error("EARTHBOUND_API_URL is not defined");
  }

  // Get the current session (Server-side)
  // This works in Server Components, Server Actions, and API Routes
  const session = await auth();
  const token = (session?.user as any)?.idToken;

  // Ensure path starts with a slash if it's not a full URL
  const normalizedPath = path.startsWith("/") || path.startsWith("http") ? path : `/${path}`;
  const url = normalizedPath.startsWith("http") ? normalizedPath : `${baseUrl}${normalizedPath}`;

  // Merge headers
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
