# API Routes & Database Functions Authentication Migration Guide

## Overview
This guide explains how to add authentication to all API routes and update database functions to support multi-user data isolation.

## Pattern for Updating API Routes

### Step 1: Import getUserId Helper
Add the import at the top of each API route file:

```typescript
import { getUserId } from "@/lib/auth/server";
```

### Step 2: Get User ID in Handler
At the beginning of each route handler (GET, POST, PUT, DELETE), add:

```typescript
const userId = await getUserId();
```

This automatically:
- Authenticates the request
- Redirects to `/sign-in` if not authenticated
- Returns the authenticated user's ID

### Step 3: Pass userId to Database Functions
Pass `userId` as a parameter to all database function calls.

## Example: Mood API Route (✅ COMPLETED)

### Before:
```typescript
export async function GET(request: NextRequest) {
  const entry = getMoodEntry(date);
  return NextResponse.json(entry);
}

export async function POST(request: NextRequest) {
  const entry = createMoodEntry(date, rating, note);
  return NextResponse.json(entry);
}
```

### After:
```typescript
import { getUserId } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  const userId = await getUserId(); // ← Add this
  const entry = getMoodEntry(date, userId); // ← Add userId
  return NextResponse.json(entry);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(); // ← Add this
  const entry = createMoodEntry(date, rating, note, userId); // ← Add userId
  return NextResponse.json(entry);
}
```

## API Routes That Need Updates

### ✅ Completed
- `/api/mood` - Mood entries

### 🔄 Needs Update
- `/api/tasks` - Task CRUD
- `/api/tasks/[id]` - Task by ID
- `/api/events` - Events CRUD
- `/api/media` - Media content CRUD
- `/api/media/[type]/[slug]` - Media by slug
- `/api/parks` - Parks CRUD
- `/api/parks/[slug]` - Parks by slug
- `/api/journals` - Journals CRUD
- `/api/journals/[slug]` - Journals by slug
- `/api/workouts/schedule` - Workout schedule
- `/api/workouts/plans` - Workout plans
- `/api/workouts/complete` - Mark workout complete
- `/api/strava/sync` - Strava sync
- `/api/strava/activities` - Strava activities
- `/api/strava/activities/by-date` - Strava activities by date
- `/api/activities` - All activities

### ⚠️ Special Cases (Read-only / External APIs)
These routes fetch from external APIs and may not need userId filtering:
- `/api/steam/status` - Steam status (external API)
- `/api/steam/recent` - Steam recent games (external API)
- `/api/steam/achievements` - Steam achievements (external API)
- `/api/homeassistant/sensors` - Home Assistant sensors (external API)
- `/api/homeassistant/state/[entityId]` - Home Assistant state (external API)
- `/api/plex/activity` - Plex activity (external API)
- `/api/plex/recent` - Plex recent (external API)
- `/api/plex/stats` - Plex stats (external API)
- `/api/imdb/search` - IMDB search (external API)
- `/api/books/search` - Books search (external API)

**For external APIs**: Still add `getUserId()` to ensure only authenticated users can access, but no database filtering needed.

## Pattern for Updating Database Functions

All database functions in `lib/db/*.ts` need to accept `userId` parameter and filter queries.

### Step 1: Add userId Parameter
```typescript
// Before
export function getAllMoodEntries() { ... }

// After
export function getAllMoodEntries(userId: string) { ... }
```

### Step 2: Add WHERE Clause
```typescript
// Before
const stmt = db.prepare("SELECT * FROM mood_entries");

// After
const stmt = db.prepare("SELECT * FROM mood_entries WHERE userId = ?");
const result = stmt.all(userId);
```

### Step 3: Add userId to INSERT Statements
```typescript
// Before
const stmt = db.prepare(`
  INSERT INTO mood_entries (date, rating, note)
  VALUES (?, ?, ?)
`);
stmt.run(date, rating, note);

// After
const stmt = db.prepare(`
  INSERT INTO mood_entries (userId, date, rating, note)
  VALUES (?, ?, ?, ?)
`);
stmt.run(userId, date, rating, note);
```

## Database Files That Need Updates

- `lib/db/mood.ts` - Mood entries functions
- `lib/db/tasks.ts` - Tasks functions
- `lib/db/events.ts` - Events functions
- `lib/db/media.ts` - Media content functions
- `lib/db/parks.ts` - Parks functions
- `lib/db/journals.ts` - Journals functions
- `lib/db/calendar.ts` - Calendar functions
- `lib/db/workouts.ts` - Workout functions
- `lib/db/strava.ts` - Strava activities functions

## Testing Checklist

After updating each route:
1. ✅ Route requires authentication (returns 401/redirects if not logged in)
2. ✅ Users can only see their own data
3. ✅ Users cannot access other users' data
4. ✅ Create operations save with correct userId
5. ✅ Update operations verify userId before modifying
6. ✅ Delete operations verify userId before deleting

## Migration Script

Before testing, run the migration script to add userId columns to existing data:

```bash
node scripts/add-user-id-columns.mjs
```

This script:
- Adds userId column to all data tables
- Assigns existing data to the first user in the database
- Creates indexes for performance

## Quick Reference

### Common userId Queries

**SELECT with userId:**
```typescript
db.prepare("SELECT * FROM table WHERE userId = ?").all(userId);
```

**INSERT with userId:**
```typescript
db.prepare("INSERT INTO table (userId, field) VALUES (?, ?)").run(userId, value);
```

**UPDATE with userId:**
```typescript
db.prepare("UPDATE table SET field = ? WHERE id = ? AND userId = ?").run(value, id, userId);
```

**DELETE with userId:**
```typescript
db.prepare("DELETE FROM table WHERE id = ? AND userId = ?").run(id, userId);
```

**CHECK OWNERSHIP:**
```typescript
const item = db.prepare("SELECT * FROM table WHERE id = ? AND userId = ?").get(id, userId);
if (!item) {
  throw new Error("Not found or access denied");
}
```

## Error Handling

```typescript
// getUserId() automatically redirects if not authenticated
// No need for manual 401 responses in most cases
try {
  const userId = await getUserId();
  // ... rest of handler
} catch (error) {
  // Will redirect to /sign-in automatically
}
```

## Next Steps

1. Update remaining API routes following the pattern above
2. Update all database functions to accept and use userId
3. Run migration script on production database
4. Test each route thoroughly
5. Verify multi-user data isolation
