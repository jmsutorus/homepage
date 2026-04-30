import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Strava from "next-auth/providers/strava";

/**
 * Edge-compatible Auth.js configuration (no database adapter, no Node.js modules)
 * Used by middleware for route protection in Edge runtime
 * Note: Credentials provider is only in auth.ts since it requires Firebase Admin SDK (Node.js only)
 */
export default {
  providers: [
    // Google OAuth Provider
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    // GitHub OAuth Provider
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    // Strava OAuth Provider
    Strava({
      clientId: process.env.AUTH_STRAVA_ID!,
      clientSecret: process.env.AUTH_STRAVA_SECRET!,
      authorization: {
        params: {
          scope: "read,activity:read_all,profile:read_all",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt", // Use JWT for Edge runtime compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = (user as any).role || 'user';
        token.haptic = (user as any).haptic !== undefined ? (user as any).haptic : true;
        token.idToken = (user as any).idToken;
        token.refreshToken = (user as any).refreshToken;

        // Extract expiration from idToken
        if (token.idToken) {
          try {
            const base64Url = (token.idToken as string).split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            token.expiresAt = payload.exp * 1000; // Firebase exp is in seconds
          } catch (e) {
            console.error("Error parsing idToken:", e);
          }
        }
      }

      if (account) {
        token.provider = account.provider;
      }

      // Handle session update
      if (trigger === "update") {
        if (session?.haptic !== undefined) token.haptic = session.haptic;
        if (session?.name !== undefined) token.name = session.name;
        if (session?.image !== undefined) token.picture = session.image;
      }

      // Check if token is expired and refresh if necessary
      // We check if it expires in the next 5 minutes to be safe
      const shouldRefresh = token.refreshToken && 
        token.expiresAt && 
        (Date.now() + 5 * 60 * 1000) > (token.expiresAt as number);

      if (shouldRefresh) {
        try {
          console.log("Refreshing Firebase ID token...");
          const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
          const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
          
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw data;
          }

          token.idToken = data.id_token;
          token.refreshToken = data.refresh_token;
          // Refreshing gives a new expiration
          token.expiresAt = Date.now() + (parseInt(data.expires_in) * 1000);
          console.log("Token refreshed successfully");
        } catch (error) {
          console.error("Error refreshing Firebase token:", error);
          // If refresh fails, we could potentially force a logout by clearing the token
          // but for now we'll just return the stale one and let the API fail
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Add user ID and info from token to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
        session.user.image = token.picture as string | null;
        session.user.role = (token.role as string) || 'user';
        session.user.haptic = token.haptic !== undefined ? (token.haptic as boolean) : true;
        (session.user as any).idToken = token.idToken as string | undefined;
        (session.user as any).provider = token.provider as string | undefined;
      }
      return session;
    },

  },

  debug: process.env.NODE_ENV === "development",

  // Trust all hosts in production (required for Firebase/serverless deployments)
  trustHost: true,
} satisfies NextAuthConfig;
