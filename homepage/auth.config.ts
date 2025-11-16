import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

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
    async jwt({ token, user, account }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
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
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;
