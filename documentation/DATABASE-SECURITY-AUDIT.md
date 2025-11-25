# 🔒 Database Security Audit Report

**Audit Date:** November 25, 2025
**Audited By:** Security Review
**Scope:** All database operation files in `/lib/db/`

---

## Executive Summary

A comprehensive security audit was conducted on all database operations in the `/lib/db` directory to verify proper user data isolation. The audit identified **4 critical vulnerabilities** where user data has NO isolation, along with several files with partial isolation issues.

**Critical Findings:**
- 4 files with CRITICAL severity issues (no user isolation)
- 1 file with HIGH severity issues (partial isolation)
- 3 files with MEDIUM-HIGH severity issues (optional/missing isolation)
- 8 files with proper security implementation

---

## ⚠️ CRITICAL SECURITY VULNERABILITIES

### **1. lib/db/cache.ts** - ❌ NO USER ISOLATION - FIXED
**Severity: CRITICAL**
**File:** `lib/db/cache.ts`

#### Issues:
All cache operations lack user isolation:
- `getCachedValue()` - No user_id filter
- `setCachedValue()` - No user_id association
- `invalidateCache()` - No user_id filter
- `invalidateCachePattern()` - No user_id filter
- `clearExpiredCache()` - Clears all users' cache
- `clearAllCache()` - Clears all users' cache

#### Impact:
Users can access and manipulate other users' cached data. This is a shared cache system with no user scoping.

#### Recommendation:
- Add `user_id` column to `api_cache` table
- Update all cache functions to require and filter by `userId`
- Implement user-scoped cache keys or separate cache namespaces

---

### **2. lib/db/workout-activities.ts** - ❌ NO USER ISOLATION - FIXED
**Severity: CRITICAL**
**File:** `lib/db/workout-activities.ts`

#### Issues:
**ALL** operations lack user isolation:

| Function | Line | Issue |
|----------|------|-------|
| `getWorkoutActivity(id)` | 62-67 | No user_id filter ❌ |
| `getAllWorkoutActivities()` | 69-74 | Returns ALL users' data ❌ |
| `getWorkoutActivitiesByDateRange()` | 76-85 | No user_id filter ❌ |
| `getWorkoutActivitiesByType()` | 87-96 | No user_id filter ❌ |
| `getUpcomingWorkoutActivities()` | 98-110 | No user_id filter ❌ |
| `getCompletedWorkoutActivities()` | 112-123 | No user_id filter ❌ |
| `updateWorkoutActivity()` | 125-146 | No user_id verification ❌ |
| `markWorkoutActivityCompleted()` | 148-161 | No user_id verification ❌ |
| `deleteWorkoutActivity()` | 163-166 | No user_id verification ❌ |
| `getWorkoutActivityStats()` | 187-253 | No user_id filter ❌ |

#### Impact:
Complete security breach - users can access, modify, and delete any user's workout activities.

#### Recommendation:
- Add `user_id` column to `workout_activities` table
- Update ALL functions to require and filter by `userId`
- Add ownership verification before UPDATE/DELETE operations

---

### **3. lib/db/events.ts** - ❌ NO USER ISOLATION - FIXED
**Severity: CRITICAL**
**File:** `lib/db/events.ts`

#### Issues:
All operations lack user isolation:

| Function | Line | Issue |
|----------|------|-------|
| `createEvent()` | 74-98 | No user_id association |
| `getEvent(id)` | 103-106 | No user_id filter |
| `getAllEvents()` | 111-114 | Returns ALL users' events |
| `getEventsForDate()` | 119-128 | No user_id filter |
| `getEventsInRange()` | 133-142 | No user_id filter |
| `updateEvent()` | 147-205 | No user_id verification |
| `deleteEvent()` | 210-213 | No user_id verification |
| `getUpcomingEvents()` | 218-232 | No user_id filter |

#### Impact:
Complete security breach - users can access, modify, and delete any user's calendar events.

#### Recommendation:
- Add `user_id` column to `events` table
- Update ALL functions to require and filter by `userId`
- Add ownership verification before UPDATE/DELETE operations

---

### **4. lib/db/journals.ts** - ❌ NO USER ISOLATION - FIXED
**Severity: CRITICAL**
**File:** `lib/db/journals.ts`

#### Issues:
Most operations lack proper user isolation:

| Function | Line | Issue |
|----------|------|-------|
| `getAllJournals()` | 122-134 | Returns ALL users' journals ❌ |
| `getPublishedJournals()` | 153-166 | Returns all users' published journals ❌ |
| `getJournalBySlug(slug)` | 171-180 | No user_id filter ❌ |
| `getJournalById(id)` | 185-194 | No user_id filter ❌ |
| `getFeaturedJournals()` | 199-212 | Returns all users' featured journals ❌ |
| `updateJournal(slug)` | 296-395 | No user_id verification ❌ |
| `getDailyJournalByDate(date)` | 400-411 | No user_id filter ❌ |
| `deleteJournal(slug)` | 416-425 | No user_id verification ❌ |

**Note:** `createJournal()` does require userId parameter (line 228), which is good.

#### Impact:
Users can read, modify, and delete any user's journal entries. This is particularly concerning for private journal content.

#### Recommendation:
- Add `userId` parameter to ALL read operations
- Add ownership verification to ALL update/delete operations
- Consider whether "published journals" should truly be public or user-scoped

---

## ⚠️ HIGH SEVERITY ISSUES

### **5. lib/db/workouts.ts** - ⚠️ PARTIAL ISOLATION
**Severity: HIGH**
**File:** `lib/db/workouts.ts`

#### Issues:
Multiple functions missing user verification:

| Function | Line | Issue |
|----------|------|-------|
| `getWorkoutPlan(id)` | 56-59 | No user_id filter ❌ |
| `getScheduledWorkout(id)` | 124-129 | No user_id filter ❌ |
| `getScheduledWorkoutByCalendarEventId()` | 131-136 | No user_id filter ❌ |
| `updateWorkoutPlan(id)` | 75-90 | No user_id verification ❌ |
| `deleteWorkoutPlan(id)` | 92-95 | No user_id verification ❌ |
| `updateScheduledWorkout(id)` | 187-202 | No user_id verification ❌ |
| `markWorkoutCompleted(id)` | 204-213 | No user_id verification ❌ |
| `deleteScheduledWorkout(id)` | 215-218 | No user_id verification ❌ |
| `getWorkoutsByType()` | 268-284 | JOIN doesn't filter by user_id ❌ |

#### Good Implementations:
✅ `getAllWorkoutPlans(userId)` - properly filters by userId (line 61-66)
✅ `getScheduledWorkouts(userId)` - properly filters by userId (line 138-158)
✅ `getWorkoutStats(userId)` - properly filters by userId (line 230-260)

#### Impact:
Users can access and modify other users' workout plans and scheduled workouts if they know the ID.

#### Recommendation:
- Add `userId` parameter to all get-by-id functions
- Add ownership verification to all update/delete operations
- Update JOIN queries to include user_id filtering

---

## ⚠️ MEDIUM-HIGH SEVERITY ISSUES

### **6. lib/db/tasks.ts** - ⚠️ PARTIAL ISOLATION
**Severity: MEDIUM-HIGH**
**File:** `lib/db/tasks.ts`

#### Issues:
Several functions missing user verification:

| Function | Line | Issue |
|----------|------|-------|
| `getTask(id)` | 59-61 | No user_id filter ❌ |
| `deleteTask(id)` | 217-220 | No user_id verification ❌ |
| `deleteCompletedTasks()` | 225-228 | Deletes ALL users' completed tasks ❌ |
| `getTaskStatistics()` | 233-258 | Returns stats for ALL users ❌ |
| `getAllTaskCategories()` | 265-269 | Returns ALL users' categories ❌ |
| `deleteTaskCategory(id)` | 296-310 | No user_id verification ❌ |
| `renameTaskCategory(id)` | 316-336 | No user_id verification ❌ |
| `getTaskVelocityData()` | 371-448 | No user_id filter ❌ |
| `getUpcomingTasks()` | 122-132 | No user_id filter ❌ |

#### Good Implementations:
✅ `getAllTasks(filter?, userId?)` - accepts optional userId parameter (line 66-103)

#### Impact:
Users can access and delete other users' tasks and categories. Statistics functions return data for all users.

#### Recommendation:
- Add `userId` parameter to all functions that currently lack it
- Make `userId` required (not optional) where appropriate
- Add ownership verification to all delete operations

---

### **7. lib/db/media.ts** - ⚠️ OPTIONAL ISOLATION
**Severity: MEDIUM-HIGH**
**File:** `lib/db/media.ts`

#### Issues:
Functions have OPTIONAL userId parameter, allowing queries without user isolation:

| Function | Line | Issue |
|----------|------|-------|
| `getMediaBySlug(slug, userId?)` | 104-115 | userId is optional ⚠️ |
| `getAllMedia(userId?)` | 120-130 | userId is optional ⚠️ |
| `getMediaByType(type, userId?)` | 135-149 | userId is optional ⚠️ |
| `getMediaByStatus(status, userId?)` | 154-168 | userId is optional ⚠️ |
| `getMediaByTypeAndStatus(type, status, userId?)` | 174-192 | userId is optional ⚠️ |
| `updateMedia(slug)` | 197-306 | No user_id verification ❌ |
| `deleteMedia(slug)` | 311-314 | No user_id verification ❌ |
| `getMediaStatistics()` | 319-351 | No user_id filter ❌ |

#### Good Implementations:
✅ `createMedia(data, userId)` - requires userId parameter (line 51-89)

#### Impact:
If called without userId, users can access other users' media. Updates and deletes don't verify ownership, allowing users to modify/delete any media by slug.

#### Recommendation:
- Make `userId` **required** (not optional) in all read functions
- Add userId verification to `updateMedia()` and `deleteMedia()`
- Add userId parameter to `getMediaStatistics()`

---

### **8. lib/db/parks.ts** - ⚠️ OPTIONAL ISOLATION
**Severity: MEDIUM-HIGH**
**File:** `lib/db/parks.ts`

#### Issues:
Similar issues to media.ts:

| Function | Line | Issue |
|----------|------|-------|
| `getAllParks(userId?)` | 74-97 | userId is optional ⚠️ |
| `getParkBySlug(slug, userId?)` | 120-136 | userId is optional ⚠️ |
| `updatePark(slug)` | 252-346 | No user_id verification ❌ |
| `deletePark(slug)` | 351-360 | No user_id verification ❌ |

#### Good Implementations:
✅ `createPark(data)` - requires userId in data parameter (line 195-247)
✅ `getPublishedParks()` - doesn't need userId (public content) (line 102-115)

#### Impact:
If called without userId, users can access other users' parks. Updates and deletes don't verify ownership.

#### Recommendation:
- Make `userId` **required** (not optional) in read functions that should be user-scoped
- Add userId verification to `updatePark()` and `deletePark()`
- Clearly distinguish between public content (published) and private content

---

## ✅ SECURE IMPLEMENTATIONS

### **lib/db/goals.ts** - ✅ GOOD ISOLATION
**File:** `lib/db/goals.ts`

All major functions properly filter by userId:
- ✅ All `get` functions require and filter by userId
- ✅ All `update` and `delete` functions verify userId
- ✅ All goal-related operations properly scoped to user

**This file serves as a good example of proper user data isolation.**

---

### **lib/db/mood.ts** - ✅ GOOD ISOLATION
**File:** `lib/db/mood.ts`

All functions require and filter by userId:
- ✅ `createMoodEntry(date, rating, note, userId)`
- ✅ `getMoodEntry(date, userId)`
- ✅ `getMoodEntriesInRange(startDate, endDate, userId)`
- ✅ `getAllMoodEntries(userId)`
- ✅ `updateMoodEntry(date, rating, note, userId)`
- ✅ `deleteMoodEntry(date, userId)`

---

### **lib/db/habits.ts** - ✅ GOOD ISOLATION
**File:** `lib/db/habits.ts`

All functions require and filter by userId:
- ✅ All CRUD operations require userId
- ✅ All query operations filter by userId
- ✅ Habit completions properly scoped to user

---

### **lib/db/quick-links.ts** - ✅ GOOD ISOLATION
**File:** `lib/db/quick-links.ts`

All functions require and filter by userId:
- ✅ All category operations require and verify userId
- ✅ All link operations require and verify userId
- ✅ Proper ownership verification on updates and deletes

---

### **lib/db/calendar-colors.ts** - ✅ GOOD ISOLATION
**File:** `lib/db/calendar-colors.ts`

All functions require and filter by userId:
- ✅ All operations properly scoped to user
- ✅ Good separation of user-specific and default colors

---

### **lib/db/calendar.ts** - ✅ GOOD ISOLATION
**File:** `lib/db/calendar.ts`

Uses `auth()` to get userId and properly filters all queries:
- ✅ `getCalendarDataForRange()` uses `await auth()` to get userId (line 439)
- ✅ All sub-queries properly filter by userId
- ✅ Tasks, goals, milestones properly scoped

---

### **lib/db/strava.ts** - ✅ ACCEPTABLE
**File:** `lib/db/strava.ts`

Properly isolated by athlete_id (which is unique per user):
- ✅ All operations filter by `athleteId`
- ✅ Activities properly linked to athletes
- ✅ No cross-user data access possible

**Note:** This is acceptable because athlete_id serves as the user identifier for Strava data.

---

### **lib/db/index.ts** - ✅ INFRASTRUCTURE ONLY
**File:** `lib/db/index.ts`

This file only provides database infrastructure (connection, query helpers). User isolation is the responsibility of files that use these functions.

---

## 📊 AUDIT SUMMARY

| Severity | Count | Files |
|----------|-------|-------|
| **Critical** | 4 | cache.ts, workout-activities.ts, events.ts, journals.ts |
| **High** | 1 | workouts.ts |
| **Medium-High** | 3 | tasks.ts, media.ts, parks.ts |
| **Secure** | 8 | goals.ts, mood.ts, habits.ts, quick-links.ts, calendar-colors.ts, calendar.ts, strava.ts, index.ts |

**Total Files Audited:** 16
**Files with Security Issues:** 8 (50%)
**Files with Proper Security:** 8 (50%)

---

## 🔧 RECOMMENDATIONS

### Immediate Action Required (Critical Priority)

1. **cache.ts**
   - [ ] Add `user_id` column to `api_cache` table
   - [ ] Update all cache functions to require and filter by `userId`
   - [ ] Implement user-scoped cache keys

2. **workout-activities.ts**
   - [ ] Add `user_id` column to `workout_activities` table
   - [ ] Update ALL functions to require `userId` parameter
   - [ ] Add ownership verification to all UPDATE/DELETE operations

3. **events.ts**
   - [ ] Add `user_id` column to `events` table
   - [ ] Update ALL functions to require `userId` parameter
   - [ ] Add ownership verification to all UPDATE/DELETE operations

4. **journals.ts**
   - [ ] Add `userId` parameter to all read operations
   - [ ] Add ownership verification to all update/delete operations
   - [ ] Review whether "published" journals should be truly public

### High Priority

5. **workouts.ts**
   - [ ] Add `userId` parameter to all get-by-id functions
   - [ ] Add ownership verification to all UPDATE/DELETE operations
   - [ ] Update JOIN queries to filter by user_id

### Medium Priority

6. **tasks.ts**
   - [ ] Add `userId` parameter to functions that currently lack it
   - [ ] Make `userId` required (not optional) where appropriate
   - [ ] Add ownership verification to all DELETE operations

7. **media.ts**
   - [ ] Make `userId` **required** in all read functions
   - [ ] Add userId verification to `updateMedia()` and `deleteMedia()`
   - [ ] Add userId parameter to `getMediaStatistics()`

8. **parks.ts**
   - [ ] Make `userId` **required** in user-scoped read functions
   - [ ] Add userId verification to `updatePark()` and `deletePark()`
   - [ ] Document which functions are public vs private

### Testing & Validation

9. **Integration Tests**
   - [ ] Create tests to verify users cannot access other users' data
   - [ ] Test all CREATE operations with different user contexts
   - [ ] Test all READ operations with different user contexts
   - [ ] Test all UPDATE operations (verify ownership checks)
   - [ ] Test all DELETE operations (verify ownership checks)
   - [ ] Test edge cases (missing userId, null userId, etc.)

10. **Code Review Process**
    - [ ] Add security checklist to PR template
    - [ ] Require explicit userId handling in all DB operations
    - [ ] Document user data isolation patterns
    - [ ] Add linting rules to catch common mistakes

---

## 🛡️ SECURITY BEST PRACTICES

Based on the secure implementations found in this audit, here are the recommended patterns:

### Pattern 1: Required userId Parameter (Preferred)
```typescript
export function getUserData(userId: string, id: number): Data | null {
  return queryOne<Data>(
    "SELECT * FROM table WHERE id = ? AND userId = ?",
    [id, userId]
  );
}
```

### Pattern 2: Use auth() for Server Components
```typescript
export async function getData(): Promise<Data[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  return query<Data>(
    "SELECT * FROM table WHERE userId = ?",
    [userId]
  );
}
```

### Pattern 3: Ownership Verification for Updates/Deletes
```typescript
export function updateData(id: number, userId: string, updates: Partial<Data>): boolean {
  // First verify ownership
  const existing = queryOne<Data>(
    "SELECT * FROM table WHERE id = ? AND userId = ?",
    [id, userId]
  );

  if (!existing) return false;

  // Then update
  const result = execute(
    "UPDATE table SET ... WHERE id = ? AND userId = ?",
    [...values, id, userId]
  );

  return result.changes > 0;
}
```

### Anti-Pattern: Optional userId (Avoid)
```typescript
// ❌ BAD - allows queries without user isolation
export function getData(userId?: string): Data[] {
  if (userId) {
    return query("SELECT * FROM table WHERE userId = ?", [userId]);
  }
  return query("SELECT * FROM table"); // Returns ALL users' data!
}
```

---

## 📝 NOTES

- This audit was conducted on November 25, 2025
- Schema changes required for several tables (adding user_id columns)
- Migration scripts will be needed for existing data
- Consider implementing a middleware layer to automatically inject userId
- Review API routes to ensure they pass authenticated userId to DB functions

---

## 🚨 COMPLIANCE CONSIDERATIONS

Proper user data isolation is critical for:
- **GDPR** - Users have the right to data privacy
- **CCPA** - California Consumer Privacy Act compliance
- **SOC 2** - Security and availability controls
- **General Security** - Preventing unauthorized data access

The issues identified in this audit could result in:
- Unauthorized data access
- Data breaches
- Compliance violations
- Loss of user trust
- Legal liability

**Immediate remediation is strongly recommended for all Critical and High severity issues.**

---

*End of Security Audit Report*
