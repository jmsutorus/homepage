import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    // Database
    DATABASE_URL: z.string().optional(),
    DATABASE_AUTH_TOKEN: z.string().optional(),

    // Node Environment
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // NextAuth
    NEXTAUTH_SECRET: z.string().min(32).optional(),
    NEXTAUTH_URL: z.string().url().optional(),

    // Strava API
    STRAVA_CLIENT_ID: z.string().optional(),
    STRAVA_CLIENT_SECRET: z.string().optional(),

    // Google Calendar API
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_REDIRECT_URI: z.string().url().optional(),

    // Steam API
    STEAM_API_KEY: z.string().optional(),
    STEAM_ID: z.string().optional(),

    // GitHub API
    GITHUB_TOKEN: z.string().optional(),

    // Home Assistant
    HOMEASSISTANT_URL: z.string().url().optional(),
    HOMEASSISTANT_TOKEN: z.string().optional(),

    // Tautulli (Plex)
    TAUTULLI_URL: z.string().url().optional(),
    TAUTULLI_API_KEY: z.string().optional(),

    // OMDb API (for IMDB data)
    OMDB_API_KEY: z.string().optional(),

    // Google Books API (for book data)
    GOOGLE_BOOKS_API_KEY: z.string().optional(),

    // Firebase Admin
    FIREBASE_PROJECT_ID: z.string().optional(),
    FIREBASE_CLIENT_EMAIL: z.string().optional(),
    FIREBASE_PRIVATE_KEY: z.string().optional(),

    // Feature Flags
    ENABLE_STEAM: z
      .string()
      .transform((val) => val === "true")
      .default("false"),
    ENABLE_STRAVA: z
      .string()
      .transform((val) => val === "true")
      .default("false"),
    ENABLE_HOMEASSISTANT: z
      .string()
      .transform((val) => val === "true")
      .default("false"),
    ENABLE_PLEX: z
      .string()
      .transform((val) => val === "true")
      .default("false"),

    // Cache TTL (seconds)
    CACHE_TTL_STRAVA: z
      .string()
      .transform((val) => parseInt(val, 10))
      .default("900"),
    CACHE_TTL_STEAM: z
      .string()
      .transform((val) => parseInt(val, 10))
      .default("300"),
    CACHE_TTL_HA: z
      .string()
      .transform((val) => parseInt(val, 10))
      .default("60"),
    CACHE_TTL_PLEX: z
      .string()
      .transform((val) => parseInt(val, 10))
      .default("120"),
  },

  /**
   * Client-side environment variables schema
   * (exposed to the browser via NEXT_PUBLIC_ prefix)
   */
  client: {
    // Add public env vars here if needed
    // NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  },

  /**
   * Environment variable values for validation
   */
  runtimeEnv: {
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,

    // Node
    NODE_ENV: process.env.NODE_ENV,

    // NextAuth
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,

    // Strava
    STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID,
    STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET,

    // Google Calendar
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,

    // Steam
    STEAM_API_KEY: process.env.STEAM_API_KEY,
    STEAM_ID: process.env.STEAM_ID,

    // GitHub
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,

    // Home Assistant
    HOMEASSISTANT_URL: process.env.HOMEASSISTANT_URL,
    HOMEASSISTANT_TOKEN: process.env.HOMEASSISTANT_TOKEN,

    // Tautulli
    TAUTULLI_URL: process.env.TAUTULLI_URL,
    TAUTULLI_API_KEY: process.env.TAUTULLI_API_KEY,

    // OMDb
    OMDB_API_KEY: process.env.OMDB_API_KEY,

    // Google Books
    GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY,

    // Firebase Admin
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,

    // Firebase Client
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

    // Feature Flags
    ENABLE_STEAM: process.env.ENABLE_STEAM,
    ENABLE_STRAVA: process.env.ENABLE_STRAVA,
    ENABLE_HOMEASSISTANT: process.env.ENABLE_HOMEASSISTANT,
    ENABLE_PLEX: process.env.ENABLE_PLEX,

    // Cache TTL
    CACHE_TTL_STRAVA: process.env.CACHE_TTL_STRAVA,
    CACHE_TTL_STEAM: process.env.CACHE_TTL_STEAM,
    CACHE_TTL_HA: process.env.CACHE_TTL_HA,
    CACHE_TTL_PLEX: process.env.CACHE_TTL_PLEX,
  },

  /**
   * Skip validation during build if true
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined.
   */
  emptyStringAsUndefined: true,
});
