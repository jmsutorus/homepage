import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { SQLiteAdapter } from "./lib/auth/adapter";
import { adminAuth } from "./lib/firebase/admin";

/**
 * Full Auth.js configuration with database adapter
 * Used in server-side contexts (API routes, server components)
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  // Spread the edge-compatible config
  ...authConfig,

  // Add the database adapter (only works in Node.js runtime)
  adapter: SQLiteAdapter(),

  // Add providers that require Node.js runtime
  providers: [
    ...authConfig.providers,

    // Credentials Provider (for Firebase email/password authentication)
    // Requires Firebase Admin SDK which only works in Node.js runtime
    Credentials({
      name: "Firebase",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
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

          if (!firebaseUser.email) {
            console.error("Firebase user missing email");
            return null;
          }

          // Check if user exists in local database
          const { queryOne, execute } = await import("@/lib/db");
          const { populateUserColorsFromDefaults } = await import("@/lib/db/calendar-colors");

          const existingUser = await queryOne<{ id: string; role: string }>(
            `SELECT u.id, ur.role 
             FROM user u 
             LEFT JOIN user_roles ur ON u.id = ur.userId 
             WHERE u.email = ?`,
            [firebaseUser.email]
          );

          let userId = firebaseUser.uid;
          let role = "user";

          if (existingUser) {
            userId = existingUser.id;
            role = existingUser.role || "user";
          } else {
            // Create user in database
            const now = Date.now();
            const slugifiedName = (firebaseUser.displayName || 'user')
              .toString()
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]+/g, '')
              .replace(/--+/g, '-');
            const idHash = firebaseUser.uid.substring(0, 8);
            const publicSlug = `${slugifiedName}+${idHash}`;

            await execute(
              `INSERT INTO user (id, email, emailVerified, name, image, publishedPhoto, showProfile, haptic, public_slug, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                firebaseUser.uid,
                firebaseUser.email,
                firebaseUser.emailVerified ? 1 : 0,
                firebaseUser.displayName || null,
                firebaseUser.photoURL || null,
                null, // publishedPhoto
                0,    // showProfile
                1,    // haptic
                publicSlug,
                now,
                now
              ]
            );

            // Populate default calendar colors
            try {
              await populateUserColorsFromDefaults(firebaseUser.uid);
            } catch (error) {
              console.error("Failed to populate default calendar colors for user:", firebaseUser.uid, error);
            }

            // Add default role
            try {
              await execute("INSERT INTO user_roles (userId, role) VALUES (?, 'user')", [firebaseUser.uid]);
            } catch (error) {
              console.error("Failed to create user role:", error);
            }
          }

          return {
            id: userId,
            email: firebaseUser.email,
            name: firebaseUser.displayName || null,
            image: firebaseUser.photoURL || null,
            emailVerified: firebaseUser.emailVerified ? new Date() : null,
            role,
            idToken: credentials.idToken as string,
            refreshToken: credentials.refreshToken as string,
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
    async signIn({ user, account }) {
      // Allow Strava to proceed even without email (for account linking)
      if (account?.provider === "strava") {
        return true;
      }

      if (!user.email) {
        console.error("Sign-in blocked: No email provided");
        return false;
      }

      try {
        const { queryOne } = await import("@/lib/db");

        // Check if allowed_users table exists and user is in it
        const tableExists = await queryOne(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='allowed_users'"
        );

        // If table doesn't exist, allow all sign-ins (graceful degradation)
        if (!tableExists) {
          console.warn("allowed_users table not found - allowing all authenticated users");
          return true;
        }

        // Check if user is in allowed_users list
        const allowed = await queryOne("SELECT 1 FROM allowed_users WHERE email = ?", [user.email]);

        if (!allowed) {
          console.warn(`Sign-in blocked: ${user.email} not in allowed_users`);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error checking allowed users:", error);
        // On error, allow sign-in to prevent lockout (log the error for debugging)
        console.error("Allowing sign-in despite error to prevent lockout");
        return true;
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
      publishedPhoto?: string | null;
      showProfile: boolean;
      role: string;
      haptic: boolean;
    };
  }
}
