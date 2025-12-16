# Relationship Tracking Feature Implementation Plan

## Overview
Add a comprehensive relationship tracking feature to track dates, intimacy, and milestones. This feature will be organized on a single `/relationship` page with tab navigation, following established patterns from mood, habits, and media tracking.

## User Requirements
- **Features:** Date nights & outings, Intimacy tracking (detailed), Relationship milestones
- **Organization:** Single page with tabs for each tracking type
- **Privacy:** Always private - no sharing/publishing features (unlike media/journals)
- **Detail Level:** Detailed intimacy tracking (date, time, duration, satisfaction, initiation, type, location, mood, notes)

## Research Insights
Based on successful relationship apps (LoveTrack, Nice Sex Tracker, Flamme, Lovewick):
- **Dates:** Track type, location, rating, cost, photos, notes
- **Intimacy:** Private tracking with satisfaction ratings, duration, initiation, mood tracking
- **Milestones:** Anniversaries, special moments, photos, categories

---

## Implementation Phases

### Phase 1: Database Foundation
**Goal:** Create tables, indexes, and helper functions

#### 1.1 Update Database Schema
**File:** `lib/db/schema.sql`

Add three new tables:

```sql
-- Table 1: relationship_dates
CREATE TABLE IF NOT EXISTS relationship_dates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  type TEXT CHECK(type IN ('dinner', 'movie', 'activity', 'outing', 'concert', 'event', 'other')) DEFAULT 'other',
  location TEXT,
  venue TEXT,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  cost REAL,
  photos TEXT,  -- JSON array
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX idx_relationship_dates_userId ON relationship_dates(userId);
CREATE INDEX idx_relationship_dates_date ON relationship_dates(date);
CREATE INDEX idx_relationship_dates_type ON relationship_dates(type);

CREATE TRIGGER update_relationship_dates_timestamp
AFTER UPDATE ON relationship_dates
BEGIN
  UPDATE relationship_dates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Table 2: intimacy_entries
CREATE TABLE IF NOT EXISTS intimacy_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  duration INTEGER,  -- minutes
  satisfaction_rating INTEGER CHECK(satisfaction_rating BETWEEN 1 AND 10),
  initiation TEXT CHECK(initiation IN ('me', 'partner', 'mutual')) DEFAULT 'mutual',
  type TEXT,
  location TEXT CHECK(location IN ('home', 'away', 'other')) DEFAULT 'home',
  mood_before TEXT CHECK(mood_before IN ('excited', 'neutral', 'tired', 'stressed', 'relaxed', 'other')),
  mood_after TEXT CHECK(mood_after IN ('satisfied', 'neutral', 'energized', 'sleepy', 'connected', 'other')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX idx_intimacy_entries_userId ON intimacy_entries(userId);
CREATE INDEX idx_intimacy_entries_date ON intimacy_entries(date);

CREATE TRIGGER update_intimacy_entries_timestamp
AFTER UPDATE ON intimacy_entries
BEGIN
  UPDATE intimacy_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Table 3: relationship_milestones
CREATE TABLE IF NOT EXISTS relationship_milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT CHECK(category IN ('anniversary', 'first', 'achievement', 'special', 'other')) DEFAULT 'special',
  description TEXT,
  photos TEXT,  -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX idx_relationship_milestones_userId ON relationship_milestones(userId);
CREATE INDEX idx_relationship_milestones_date ON relationship_milestones(date);

CREATE TRIGGER update_relationship_milestones_timestamp
AFTER UPDATE ON relationship_milestones
BEGIN
  UPDATE relationship_milestones SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

#### 1.2 Create Database Helper Functions
**File:** `lib/db/relationship.ts` (NEW)

Pattern: Follow `lib/db/mood.ts` structure

**Interfaces:**
- `RelationshipDate` - matches relationship_dates table
- `IntimacyEntry` - matches intimacy_entries table
- `RelationshipMilestone` - matches relationship_milestones table

**Functions to implement:**
- `createRelationshipDate()` - Create/update date entry
- `getRelationshipDates()` - Get all dates for user
- `getRelationshipDatesInRange()` - Filter by date range
- `updateRelationshipDate()` - Update existing date
- `deleteRelationshipDate()` - Delete date entry
- `createIntimacyEntry()` - Create intimacy entry
- `getIntimacyEntries()` - Get all entries for user
- `getIntimacyEntriesInRange()` - Filter by date range
- `updateIntimacyEntry()` - Update entry
- `deleteIntimacyEntry()` - Delete entry
- `createRelationshipMilestone()` - Create milestone
- `getMilestones()` - Get all milestones
- `updateMilestone()` - Update milestone
- `deleteMilestone()` - Delete milestone
- `getRelationshipStats()` - Calculate statistics (totals, averages, frequencies)

**Achievement integration:**
```typescript
// In create functions, trigger achievements
checkAchievement(userId, 'relationship').catch(console.error);
```

---

### Phase 2: API Routes
**Goal:** Create REST endpoints for all three data types

Pattern: Follow `app/api/mood/route.ts` structure

#### 2.1 Dates API Routes

**File:** `app/api/relationship/dates/route.ts` (NEW)
- GET: List dates (query params: startDate, endDate, type)
- POST: Create new date (body: date, time, type, location, venue, rating, cost, photos, notes)

**File:** `app/api/relationship/dates/[id]/route.ts` (NEW)
- GET: Get specific date
- PATCH: Update date
- DELETE: Delete date

#### 2.2 Intimacy API Routes

**File:** `app/api/relationship/intimacy/route.ts` (NEW)
- GET: List entries (query params: startDate, endDate)
- POST: Create new entry (body: date, time, duration, satisfaction_rating, initiation, type, location, mood_before, mood_after, notes)

**File:** `app/api/relationship/intimacy/[id]/route.ts` (NEW)
- GET: Get specific entry
- PATCH: Update entry
- DELETE: Delete entry

#### 2.3 Milestones API Routes

**File:** `app/api/relationship/milestones/route.ts` (NEW)
- GET: List milestones (query params: startDate, endDate, category)
- POST: Create new milestone (body: title, date, category, description, photos)

**File:** `app/api/relationship/milestones/[id]/route.ts` (NEW)
- GET: Get specific milestone
- PATCH: Update milestone
- DELETE: Delete milestone

#### 2.4 Statistics API Route

**File:** `app/api/relationship/stats/route.ts` (NEW)
- GET: Return relationship statistics (totals, averages, frequency trends)

**All routes must:**
- Use `requireAuthApi()` to verify authentication
- Always filter by `session.user.id`
- Validate input before processing
- Return proper error codes (401, 400, 404, 500)

---

### Phase 3: Main Page & Components
**Goal:** Create the main relationship page with tab navigation

#### 3.1 Main Page (Server Component)
**File:** `app/(dashboard)/relationship/page.tsx` (NEW)

Pattern: Follow server component pattern from media page
- Authenticate user
- Fetch initial data for all three tabs in parallel
- Pass to client component

```typescript
export default async function RelationshipPage() {
  const session = await auth();
  if (!session) redirect("/");

  const userId = session.user.id;

  const [dates, intimacyEntries, milestones, stats] = await Promise.all([
    getRelationshipDates(userId),
    getIntimacyEntries(userId),
    getMilestones(userId),
    getRelationshipStats(userId),
  ]);

  return <RelationshipPageClient ... />;
}
```

#### 3.2 Client Component with Tabs
**File:** `app/(dashboard)/relationship/page-client.tsx` (NEW)

- Use `Tabs` component from shadcn/ui
- Three tabs: "Dates & Outings", "Intimacy", "Milestones"
- Include stats widget at top
- Pass initial data to each tab component

#### 3.3 Stats Dashboard Widget
**File:** `components/widgets/relationship/relationship-stats.tsx` (NEW)

Display key metrics:
- Total dates this month/year
- Total intimacy entries
- Total milestones
- Average date rating (with `AnimatedProgressRing`)
- Average satisfaction rating (with `AnimatedProgressRing`)
- Frequency trends (bar charts with Recharts)

---

### Phase 4: Dates Tab Components
**Goal:** Build date tracking UI

#### 4.1 Dates Tab
**File:** `components/widgets/relationship/dates-tab.tsx` (NEW)

- Card-based list view (pattern from habits-list)
- Filter by type, date range
- "Add Date" button to open dialog
- Display: date, type, venue, rating, notes preview

#### 4.2 Create Date Dialog
**File:** `components/widgets/relationship/create-date-dialog.tsx` (NEW)

**Pattern:** Follow `mood-entry-modal.tsx` with SuccessCheck animation

**Form fields:**
- Date picker (required)
- Time picker (optional)
- Type selector (dinner, movie, activity, etc.)
- Location/Venue inputs
- Rating selector (1-5 stars)
- Cost input (optional)
- Notes textarea

**Success feedback:** SuccessCheck animation
```typescript
const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
  duration: 2000,
  onClose: () => setIsOpen(false),
});

// After successful create
triggerSuccess();
// Show: "Date Night Logged!" with motivational message
```

#### 4.3 Edit Date Dialog
**File:** `components/widgets/relationship/edit-date-dialog.tsx` (NEW)

Same form as create, but:
- Pre-populated with existing data
- No success animation on edit (only create)
- Use toast for edit confirmation

---

### Phase 5: Intimacy Tab Components
**Goal:** Build private intimacy tracking UI

#### 5.1 Intimacy Tab
**File:** `components/widgets/relationship/intimacy-tab.tsx` (NEW)

- Privacy indicator at top (Lock icon + "Private - visible only to you")
- Calendar/list view of entries
- "Add Entry" button
- Display: date, satisfaction rating, duration

#### 5.2 Create Intimacy Dialog
**File:** `components/widgets/relationship/create-intimacy-dialog.tsx` (NEW)

**Pattern:** Follow `mood-entry-modal.tsx` with SuccessCheck animation

**Form fields:**
- Date picker (required)
- Time picker (optional)
- Duration (minutes)
- Satisfaction rating (1-10 slider)
- Initiation (me, partner, mutual)
- Type (text input)
- Location (home, away, other)
- Mood before (dropdown)
- Mood after (dropdown)
- Notes (textarea, private)

**Success feedback:** SuccessCheck animation
```typescript
// Success message
<SuccessCheck size={120} />
<h3>Entry Logged</h3>
<p>Your private entry has been securely saved.</p>
```

#### 5.3 Edit Intimacy Dialog
**File:** `components/widgets/relationship/edit-intimacy-dialog.tsx` (NEW)

Same as create, but no success animation on edit

---

### Phase 6: Milestones Tab Components
**Goal:** Build milestone tracking UI

#### 6.1 Milestones Tab
**File:** `components/widgets/relationship/milestones-tab.tsx` (NEW)

- Timeline view of milestones (sorted by date)
- Filter by category
- "Add Milestone" button
- Display: title, date, category, description preview, photos

#### 6.2 Create Milestone Dialog
**File:** `components/widgets/relationship/create-milestone-dialog.tsx` (NEW)

**Pattern:** Follow `mood-entry-modal.tsx` with SuccessCheck animation

**Form fields:**
- Title (required)
- Date picker (required)
- Category (anniversary, first, achievement, special, other)
- Description (textarea)
- Photo upload (optional, JSON array)

**Success feedback:** SuccessCheck animation
```typescript
// Success message
<SuccessCheck size={120} />
<h3>Milestone Created!</h3>
<p>This special moment has been preserved forever.</p>
```

#### 6.3 Edit Milestone Dialog
**File:** `components/widgets/relationship/edit-milestone-dialog.tsx` (NEW)

Same as create, but no success animation on edit

---

### Phase 7: Navigation Integration
**Goal:** Add relationship link to navigation

#### 7.1 Header Navigation
**File:** `components/layout/header.tsx`

Add to "Track" dropdown:
```typescript
<DropdownMenuItem asChild>
  <Link href="/relationship">
    <Heart className="mr-2 h-4 w-4" />
    Relationship
  </Link>
</DropdownMenuItem>
```

Position: After Mood, before any other items

#### 7.2 Mobile Navigation
**File:** `components/layout/mobile-nav.tsx`

Add to Track section:
```typescript
<Link href="/relationship">
  <Heart className="mr-2 h-4 w-4" />
  Relationship
</Link>
```

---

### Phase 8: Achievements Integration
**Goal:** Add relationship achievements

**File:** `lib/achievements.ts`

Add new achievements:
```typescript
{
  id: 'relationship-first-date',
  title: 'Date Night',
  description: 'Log your first date',
  category: 'relationship',
  points: 5,
  target_value: 1,
},
{
  id: 'relationship-10-dates',
  title: 'Making Memories',
  description: 'Log 10 dates',
  category: 'relationship',
  points: 15,
  target_value: 10,
},
{
  id: 'relationship-50-dates',
  title: 'Date Night Champions',
  description: 'Log 50 dates',
  category: 'relationship',
  points: 50,
  target_value: 50,
},
{
  id: 'relationship-first-milestone',
  title: 'Special Moment',
  description: 'Record your first milestone',
  category: 'relationship',
  points: 10,
  target_value: 1,
},
```

---

### Phase 9: Calendar Integration (Optional Enhancement)
**Goal:** Show relationship dates on calendar

**File:** `lib/db/calendar.ts`

Add relationship dates to calendar items:
```typescript
const relationshipDates = await query(
  "SELECT * FROM relationship_dates WHERE userId = ? AND date = ?",
  [userId, date]
);

// Map to calendar items with pink color
```

**File:** `lib/db/calendar-colors.ts`

Add default color:
```typescript
{
  category: 'relationship.date',
  bg_color: 'bg-pink-500',
  text_color: 'text-pink-500'
}
```

---

## Critical Files Summary

### New Files to Create (22 files)
1. `lib/db/relationship.ts` - Database helper functions
2. `app/api/relationship/dates/route.ts` - Dates API
3. `app/api/relationship/dates/[id]/route.ts` - Individual date API
4. `app/api/relationship/intimacy/route.ts` - Intimacy API
5. `app/api/relationship/intimacy/[id]/route.ts` - Individual intimacy API
6. `app/api/relationship/milestones/route.ts` - Milestones API
7. `app/api/relationship/milestones/[id]/route.ts` - Individual milestone API
8. `app/api/relationship/stats/route.ts` - Statistics API
9. `app/(dashboard)/relationship/page.tsx` - Main page (server)
10. `app/(dashboard)/relationship/page-client.tsx` - Main page (client with tabs)
11. `components/widgets/relationship/relationship-stats.tsx` - Stats widget
12. `components/widgets/relationship/dates-tab.tsx` - Dates list view
13. `components/widgets/relationship/create-date-dialog.tsx` - Create date form
14. `components/widgets/relationship/edit-date-dialog.tsx` - Edit date form
15. `components/widgets/relationship/intimacy-tab.tsx` - Intimacy list view
16. `components/widgets/relationship/create-intimacy-dialog.tsx` - Create intimacy form
17. `components/widgets/relationship/edit-intimacy-dialog.tsx` - Edit intimacy form
18. `components/widgets/relationship/milestones-tab.tsx` - Milestones timeline
19. `components/widgets/relationship/create-milestone-dialog.tsx` - Create milestone form
20. `components/widgets/relationship/edit-milestone-dialog.tsx` - Edit milestone form
21. `components/widgets/relationship/` - Create this directory first

### Files to Modify (4 files)
1. `lib/db/schema.sql` - Add three new tables with indexes and triggers
2. `components/layout/header.tsx` - Add to Track dropdown
3. `components/layout/mobile-nav.tsx` - Add to Track section
4. `lib/achievements.ts` - Add relationship achievements
5. `lib/success-toasts.ts` - Add "date" and "milestone" to EntityType (intimacy uses generic success)

---

## Key Implementation Notes

### Privacy First
- **NO** `published` or `featured` fields in database
- **NO** public viewing URLs
- **NO** sharing buttons in UI
- Privacy indicator on intimacy tab
- All API routes filter by authenticated userId

### Success Feedback Pattern
- **Dates:** SuccessCheck animation - "Date Night Logged!"
- **Intimacy:** SuccessCheck animation - "Entry Logged" (with privacy reassurance)
- **Milestones:** SuccessCheck animation - "Milestone Created!"
- **Edits:** Use toast notifications (NOT animations)

### Data Validation
- All API routes: require auth, validate input, proper error codes
- Rating constraints: 1-5 for dates, 1-10 for intimacy
- CHECK constraints in database for type/category fields
- Cost must be non-negative

### UI Patterns to Follow
- Button component (NOT native button)
- Dialog-based forms with DialogHeader/DialogFooter
- Card-based list layouts
- AnimatedProgress for frequency tracking
- AnimatedProgressRing for satisfaction ratings
- Recharts for trend visualization
- Loading states: `disabled={isSaving}`
- Grid layouts: `grid grid-cols-2 gap-4` for responsive forms

### Performance
- Parallel data fetching with Promise.all()
- Database indexes on userId, date, type/category
- Date range filtering instead of loading all data
- Consider pagination for users with 100+ entries

---

## Testing Checklist

### Dates Tab
- [ ] Create new date entry → SuccessCheck animation shows
- [ ] Edit existing date → Toast notification (no animation)
- [ ] Delete date → Confirmation + success toast
- [ ] Filter by type works
- [ ] Filter by date range works
- [ ] Stats update after create/edit/delete

### Intimacy Tab
- [ ] Privacy indicator visible
- [ ] Create entry → SuccessCheck with privacy message
- [ ] Edit entry → Toast (no animation)
- [ ] Delete entry → Confirmation
- [ ] All detailed fields save correctly
- [ ] Charts show trends

### Milestones Tab
- [ ] Create milestone → SuccessCheck animation
- [ ] Edit milestone → Toast (no animation)
- [ ] Delete milestone → Confirmation
- [ ] Timeline view sorts by date
- [ ] Photos upload works (if implemented)

### General
- [ ] Navigation works (desktop + mobile)
- [ ] Achievements unlock at correct thresholds
- [ ] Stats calculations accurate
- [ ] All charts render
- [ ] Mobile responsive
- [ ] No sharing/publish options visible anywhere
- [ ] Private data truly isolated by userId

---

## Implementation Order

1. **Database** (schema + helper functions) - Foundation
2. **API Routes** (dates, intimacy, milestones, stats) - Data layer
3. **Main Page** (server + client with tabs) - Structure
4. **Dates Components** (tab + dialogs) - First feature
5. **Intimacy Components** (tab + dialogs) - Second feature
6. **Milestones Components** (tab + dialogs) - Third feature
7. **Stats Widget** (dashboard with charts) - Visual polish
8. **Navigation** (header + mobile) - Discoverability
9. **Achievements** (add to achievements.ts) - Gamification
10. **Calendar Integration** (optional) - Extra integration

**Estimated time:** 2-3 days for full implementation

---

## Resources & References

**Pattern Files:**
- Database: `lib/db/mood.ts`
- API: `app/api/mood/route.ts`
- Success Dialog: `components/widgets/mood/mood-entry-modal.tsx`
- Success Toasts: `lib/success-toasts.ts`
- Animated Progress: `components/ui/animations/animated-progress.tsx`

**Documentation:**
- Success Feedback: `/documentation/SUCCESS-FEEDBACK-GUIDE.md`
- Animated Progress: `/documentation/ANIMATED-PROGRESS-GUIDE.md`
- Project Guidelines: `/.claude/CLAUDE.md`
