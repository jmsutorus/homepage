import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { getDatabase } from "@/lib/db";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: getDatabase() as any,
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3001",

  emailAndPassword: {
    enabled: false, // Disable email/password auth, use OAuth only
  },

  plugins: [
    genericOAuth({
      config: [
        // Strava OAuth provider for exercise tracking
        {
          providerId: "strava",
          authorizationEndpoint: "https://www.strava.com/oauth/authorize",
          tokenEndpoint: "https://www.strava.com/oauth/token",
          clientId: env.STRAVA_CLIENT_ID || "",
          clientSecret: env.STRAVA_CLIENT_SECRET || "",
          scopes: ["read", "activity:read_all"],
          pkce: false,
        },
        // Google OAuth provider for Calendar integration
        {
          providerId: "google",
          discoveryUrl: "https://accounts.google.com/.well-known/openid-configuration",
          clientId: process.env.GOOGLE_CLIENT_ID || "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
          scopes: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/calendar.readonly",
          ],
        },
      ],
    }),
  ],

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - update session if older than this
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Advanced options
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
