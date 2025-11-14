# Firebase Authentication with Auth.js (NextAuth v5) Implementation Plan

## Overview
Implement Firebase Authentication using Auth.js (NextAuth v5) as the session management layer. Use Firebase Auth SDK for actual authentication (email/password, Google OAuth) and Auth.js for server-side session handling and route protection.

## Architecture
- **Client-side**: Firebase Auth SDK for sign-up/sign-in
- **Server-side**: Auth.js for session management and route protection
- **Database**: SQLite (existing) with Auth.js adapter
- **Auth Methods**: Email/password + Google OAuth via Firebase

## Phase 1: Dependencies & Setup (10 min)
1. Install packages:
   - Keep `next-auth@5.0.0-beta.30` (already installed)
   - Install `firebase` (client SDK)
   - Install `firebase-admin` (server SDK)
   - Remove `better-auth` dependency
2. Set up environment variables:
   - Firebase Web API Key
   - Firebase Project ID
   - Firebase Auth Domain
   - Firebase Admin SDK credentials
   - `AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - Google OAuth credentials

## Phase 2: Firebase Configuration (10 min)
1. Create `lib/firebase/client.ts` - Firebase client SDK initialization
2. Create `lib/firebase/admin.ts` - Firebase Admin SDK initialization
3. Configure Firebase Console:
   - Enable Email/Password authentication
   - Enable Google OAuth provider
   - Add authorized domains

## Phase 3: Auth.js Configuration (20 min)
1. Create `auth.ts` in root with NextAuth config:
   - Configure Credentials provider for Firebase token verification
   - Configure Google OAuth provider (direct Auth.js provider)
   - Set up callbacks to verify Firebase tokens server-side
   - Use existing SQLite database with Drizzle/Prisma adapter OR custom adapter
2. Create `app/api/auth/[...nextauth]/route.ts` - Auth.js API route handler
3. Create custom adapter for SQLite using existing user/session/account tables

## Phase 4: Database Schema Updates (20 min)
1. **Add userId to all data tables**: mood_entries, tasks, journals, media_content, parks, strava_activities, workout_activities, events, journal_links
2. Update schema:
   - Add `userId TEXT NOT NULL` to each table
   - Add `FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE`
   - Add indexes: `CREATE INDEX idx_[table]_userId ON [table](userId)`
3. Handle existing data migration
4. Update all `lib/db/*.ts` files to filter by userId

## Phase 5: Middleware for Route Protection (15 min)
1. Create `middleware.ts` using Auth.js auth function
2. Configure protected routes:
   - All dashboard routes: `/`, `/calendar`, `/mood`, etc.
   - All API routes: `/api/tasks/*`, `/api/mood/*`, etc.
3. Define public routes: `/sign-in`, `/sign-up`
4. Redirect unauthenticated users to sign-in

## Phase 6: Authentication UI Pages (30 min)
1. Create `app/sign-in/page.tsx`:
   - Email/password form using Firebase `signInWithEmailAndPassword`
   - Google OAuth button using Firebase `signInWithPopup`
   - After Firebase auth, create Auth.js session
   - Error handling and loading states
2. Create `app/sign-up/page.tsx`:
   - Email/password registration using Firebase `createUserWithEmailAndPassword`
   - Google OAuth button
   - Auto sign-in after successful registration
3. Create `app/api/auth/firebase-session/route.ts`:
   - Custom endpoint to exchange Firebase token for Auth.js session
4. Update `components/layout/header.tsx`:
   - Show user info from Auth.js session
   - Add sign-out button (calls both Firebase and Auth.js signOut)

## Phase 7: Session Management Helpers (15 min)
1. Create `lib/auth/server.ts`:
   - `requireAuth()` helper to get session and throw if unauthenticated
   - `getSession()` helper for optional auth
   - Extract userId from session
2. Create `lib/auth/client.ts`:
   - Firebase auth state listener
   - Helper to sync Firebase auth with Auth.js session

## Phase 8: Protect API Routes (45 min)
1. Update ALL API routes to use `requireAuth()`:
   - `/api/tasks/*` - CRUD operations filtered by userId
   - `/api/mood/*` - Filter by userId
   - `/api/journals/*` - Filter by userId
   - `/api/media/*` - Filter by userId
   - `/api/parks/*` - Filter by userId
   - `/api/events/*` - Filter by userId
   - `/api/workouts/*` - Filter by userId
   - `/api/strava/*` - Associate with userId
   - Integration APIs (Steam, Home Assistant, Plex) - Associate with userId
2. Return 401 for unauthenticated requests
3. Validate userId exists in all mutations

## Phase 9: Protect Dashboard Pages (20 min)
1. Update all dashboard Server Components:
   - Call `auth()` from Auth.js to get session
   - Redirect to `/sign-in` if no session
   - Pass userId to data fetching functions
2. Create loading/error states for auth checks

## Phase 10: Clean Up Better-Auth (10 min)
1. Remove Better-Auth files:
   - Delete `lib/auth-better.ts`
   - Delete `app/api/auth/[...all]/route.ts`
2. Remove from `package.json` and run install
3. Keep existing user/session/account tables (reuse for Auth.js)
4. Update or remove auth error page

## Phase 11: Client-Side Session Provider (10 min)
1. Create `components/providers/session-provider.tsx`:
   - Wrap app with Auth.js SessionProvider
   - Sync Firebase auth state with Auth.js
2. Update `app/layout.tsx` to include SessionProvider
3. Create `hooks/useAuth.ts` for client components

## Phase 12: Testing & Validation (20 min)
1. Test email/password sign-up and sign-in
2. Test Google OAuth sign-up and sign-in
3. Test sign-out (both Firebase and Auth.js)
4. Verify unauthenticated users redirected to sign-in
5. Verify users only see their own data
6. Test all API routes require authentication
7. Verify multi-user data isolation works
8. Test existing integrations still work

**Total Estimated Time: ~3.5 hours**

## Key Implementation Details

### Auth Flow
1. User signs in with Firebase SDK (client)
2. Get Firebase ID token
3. Send token to custom API endpoint
4. Verify token with Firebase Admin SDK (server)
5. Create Auth.js session with user data
6. Auth.js manages session cookies and protection

### Files to Create/Modify
- ✅ Create: `auth.ts`, `middleware.ts`, `lib/firebase/client.ts`, `lib/firebase/admin.ts`
- ✅ Create: `app/sign-in/page.tsx`, `app/sign-up/page.tsx`
- ✅ Create: `app/api/auth/[...nextauth]/route.ts`, `app/api/auth/firebase-session/route.ts`
- ✅ Create: `lib/auth/server.ts`, `lib/auth/client.ts`, `hooks/useAuth.ts`
- ✅ Modify: All API routes, all dashboard pages, `lib/db/schema.sql`
- ✅ Modify: `components/layout/header.tsx`, `app/layout.tsx`
- ✅ Delete: `lib/auth-better.ts`, `app/api/auth/[...all]/route.ts`

## Environment Variables Required

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Firebase Admin SDK
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Auth.js
AUTH_SECRET=  # Generate with: openssl rand -base64 32
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Application
NEXTAUTH_URL=http://localhost:3000
```

## Why Auth.js + Firebase?

This hybrid approach gives us:
- **Industry Standard**: Auth.js (NextAuth) is the most widely adopted auth solution for Next.js
- **Firebase Benefits**: Leverages Firebase's robust authentication (email/password, OAuth providers)
- **Best of Both**: Firebase handles credential management, Auth.js handles session management
- **Community Support**: Both libraries have extensive documentation and community support
- **Multi-user Ready**: Auth.js session management works seamlessly with multi-user data isolation
- **Existing Infrastructure**: Reuses your current database tables with minimal modifications

This approach uses the industry-standard Auth.js (NextAuth) while leveraging Firebase Authentication for the actual credential management and Google OAuth.
