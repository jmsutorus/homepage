import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { SQLiteAdapter } from "./lib/auth/adapter";
import { adminAuth } from "./lib/firebase/admin";
import path from "path";

/**
 * Get the database path, handling both file: URLs and plain paths
 */
function getDatabasePath(): string {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    // Default to absolute path
    return path.join(process.cwd(), "data", "homepage.db");
  }

  // Remove 'file:' prefix if present
  if (dbUrl.startsWith("file:")) {
    const dbPath = dbUrl.replace("file:", "");
    // If it's a relative path, make it absolute
    if (dbPath.startsWith("./")) {
      return path.join(process.cwd(), dbPath.slice(2));
    }
    return dbPath;
  }

  // If it's a relative path, make it absolute
  if (dbUrl.startsWith("./")) {
    return path.join(process.cwd(), dbUrl.slice(2));
  }

  return dbUrl;
}

/**
 * Full Auth.js configuration with database adapter
 * Used in server-side contexts (API routes, server components)
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  // Spread the edge-compatible config
  ...authConfig,

  // Add the database adapter (only works in Node.js runtime)
  adapter: SQLiteAdapter(getDatabasePath()),

  // Add providers that require Node.js runtime
  providers: [
    ...authConfig.providers,

    // Credentials Provider (for Firebase email/password authentication)
    // Requires Firebase Admin SDK which only works in Node.js runtime
    Credentials({
      name: "Firebase",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.idToken) {
            return null;
          }

          // Verify Firebase ID token
          const decodedToken = await adminAuth.verifyIdToken(
            credentials.idToken as string
          );

          // Get user from Firebase
          const firebaseUser = await adminAuth.getUser(decodedToken.uid);

          return {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || null,
            image: firebaseUser.photoURL || null,
            emailVerified: firebaseUser.emailVerified ? new Date() : null,
          };
        } catch (error) {
          console.error("Firebase auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Merge the callbacks from auth.config.ts
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const { queryOne } = await import("@/lib/db");
        const allowed = queryOne("SELECT 1 FROM allowed_users WHERE email = ?", [user.email]);
        return !!allowed;
      } catch (error) {
        console.error("Error checking allowed users:", error);
        return false;
      }
    },
  },
});

// Extend the session type to include user ID
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}
