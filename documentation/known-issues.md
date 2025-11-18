# Known Issues and Solutions

This document tracks common issues encountered in the codebase and their solutions to prevent regression.

## Date Formatting Issues

### Issue: Date Display Off by One Day

**Problem:**
When displaying dates in the calendar and other components, dates would sometimes appear off by one day (e.g., an event on January 15th would display as January 14th).

**Root Cause:**
JavaScript's `Date` constructor interprets date strings in the format `YYYY-MM-DD` as UTC time at midnight (00:00:00 UTC). When converting to local time using methods like `toLocaleDateString()`, users in timezones behind UTC would see the previous day.

**Example of the Bug:**
```typescript
// INCORRECT - This can cause date shifts
const dateStr = "2025-01-15";
const date = new Date(dateStr); // Interpreted as 2025-01-15T00:00:00Z (UTC)
const display = date.toLocaleDateString(); // In PST (UTC-8), shows "1/14/2025"
```

**Solution:**
Created utility functions `formatDateSafe()` and `formatDateLongSafe()` in `lib/utils.ts` that parse the date components directly and create a Date object in the local timezone:

```typescript
// CORRECT - Always displays the correct date
export function formatDateSafe(dateString: string): string {
  if (!dateString) return "";

  // Handle ISO datetime strings (YYYY-MM-DDTHH:MM:SS)
  const datePart = dateString.split("T")[0];

  // Parse date components to avoid timezone issues
  const [year, month, day] = datePart.split("-").map(Number);

  // Create date in local timezone (not UTC)
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString();
}
```

**Files Fixed:**
- `components/widgets/calendar-month-summary.tsx` - Media completion dates, activity dates, event dates
- `components/widgets/calendar-day-detail.tsx` - Event dates, task due dates, task completion dates
- `components/widgets/mood-entry-modal.tsx` - Mood entry date display
- `components/widgets/mood-month-view.tsx` - Month filtering logic
- `components/widgets/media-card.tsx` - Media completion and started dates
- `components/widgets/markdown-preview.tsx` - Media completion and started dates
- `app/(dashboard)/media/[type]/[slug]/page.tsx` - Media detail page dates
- `components/widgets/calendar-view.tsx` - Removed unnecessary date format conversions (YYYY/MM/DD to YYYY-MM-DD)
- `components/widgets/mood-heatmap.tsx` - Fixed getTodayString to use YYYY-MM-DD format
- `lib/utils.ts` - Updated formatDateSafe and formatDateLongSafe to handle both YYYY-MM-DD and YYYY/MM/DD formats

**Prevention:**
- **ALWAYS** use `formatDateSafe()` or `formatDateLongSafe()` from `lib/utils.ts` when displaying dates stored in `YYYY-MM-DD` format
- **NEVER** use `new Date(dateString).toLocaleDateString()` directly with date-only strings
- **ALWAYS** use `YYYY-MM-DD` format consistently throughout the application (database uses this format)
- **AVOID** converting dates to `YYYY/MM/DD` format unless absolutely necessary for external libraries
- When reviewing PRs, watch for any usage of `new Date()` with date strings - ensure they use the utility functions
- When passing dates between components, maintain the `YYYY-MM-DD` format to avoid conversion issues

**Detection:**
Search for the pattern:
```bash
# Find potentially problematic date formatting
grep -r "new Date.*toLocaleDateString" --include="*.tsx" --include="*.ts"
```

**Related Database Fields:**
This issue affects any date field stored in `YYYY-MM-DD` format or SQLite TIMESTAMP format (`YYYY-MM-DD HH:MM:SS`):
- `media_content.completed` - Media completion dates
- `media_content.started` - Media start dates
- `media_content.released` - Media release dates
- `media_content.created_at` - Timestamp
- `media_content.updated_at` - Timestamp
- `events.date` - Event dates
- `events.end_date` - Event end dates
- `events.created_at` - Timestamp
- `events.updated_at` - Timestamp
- `tasks.due_date` - Task due dates
- `tasks.completed_date` - Task completion dates
- `tasks.created_at` - Timestamp
- `tasks.updated_at` - Timestamp
- `strava_activities.start_date_local` - Activity dates
- `strava_activities.created_at` - Timestamp
- `strava_activities.updated_at` - Timestamp
- `mood_entries.date` - Mood entry dates
- `mood_entries.created_at` - Timestamp
- `mood_entries.updated_at` - Timestamp
- `parks.visited` - Park visit dates
- `parks.created_at` - Timestamp
- `parks.updated_at` - Timestamp
- `journals.daily_date` - Daily journal dates
- `journals.created_at` - Timestamp
- `journals.updated_at` - Timestamp

### Sub-Issue: Mood Modal Date Format Conversion

**Problem:**
The mood entry modal was showing "Invalid format" errors when invoked from the `/calendar` and `/mood` pages because dates were being unnecessarily converted between `YYYY-MM-DD` and `YYYY/MM/DD` formats.

**Root Cause:**
Components were converting dates from `YYYY-MM-DD` (database format) to `YYYY/MM/DD` before passing to the modal, then converting back for API calls. This caused:
1. Inconsistent date formats across the application
2. Potential parsing errors when the formatter expected one format but received another
3. Extra complexity and points of failure

**Solution:**
1. Removed all unnecessary date format conversions - use `YYYY-MM-DD` consistently
2. Updated `formatDateSafe()` and `formatDateLongSafe()` to handle both formats gracefully as a safety measure
3. Standardized all date strings to use `YYYY-MM-DD` format throughout the application

**Example of Removed Code:**
```typescript
// REMOVED - Unnecessary conversion
const handleOpenMoodModal = (date: string) => {
  const formattedDate = date.replace(/-/g, '/'); // Converting YYYY-MM-DD to YYYY/MM/DD
  setSelectedDate(formattedDate);
  setIsMoodModalOpen(true);
};

// CORRECT - Use YYYY-MM-DD directly
const handleOpenMoodModal = (date: string) => {
  setSelectedDate(date); // Keep in YYYY-MM-DD format
  setIsMoodModalOpen(true);
};
```

### Sub-Issue: SQLite Timestamp Format Handling

**Problem:**
The journal detail page and other pages were showing "Invalid" for created_at and updated_at dates because the `formatDateSafe()` and `formatDateLongSafe()` utility functions didn't properly handle SQLite TIMESTAMP format (`YYYY-MM-DD HH:MM:SS` with space separator).

**Root Cause:**
The utility functions only split on "T" to extract the date part from ISO datetime strings (`YYYY-MM-DDTHH:MM:SS`), but SQLite stores timestamps with a space separator (`YYYY-MM-DD HH:MM:SS`). When passed a SQLite timestamp, the functions would try to parse the entire string including the time portion, resulting in invalid date parsing.

**Example of the Bug:**
```typescript
// SQLite timestamp format
const timestamp = "2025-11-14 18:12:55";

// OLD CODE - Only splits on "T", doesn't handle space separator
const datePart = dateString.split("T")[0]; // Returns "2025-11-14 18:12:55" (unchanged)
const [year, month, day] = datePart.split("-").map(Number);
// Result: [2025, 11, "14 18:12:55"] - day becomes NaN after Number()
// Date display: "Invalid Date"
```

**Solution:**
Updated both `formatDateSafe()` and `formatDateLongSafe()` to split on both "T" and space " " characters to handle both ISO format and SQLite TIMESTAMP format:

```typescript
// CORRECT - Handles both "T" and space separators
const datePart = dateString.split("T")[0].split(" ")[0];
// For "2025-11-14 18:12:55": Returns "2025-11-14"
// For "2025-11-14T18:12:55": Returns "2025-11-14"
// For "2025-11-14": Returns "2025-11-14"
```

**Files Fixed:**
- `lib/utils.ts` - Updated `formatDateSafe()` and `formatDateLongSafe()` to handle SQLite timestamps

**Prevention:**
- The utility functions now handle all common date/timestamp formats automatically
- Always use `formatDateSafe()` or `formatDateLongSafe()` for displaying any date fields from the database
- No conversion needed for SQLite TIMESTAMP fields - the utility functions handle them correctly

**Related Pages:**
- `app/(dashboard)/journals/[slug]/page.tsx` - Journal detail page created_at/updated_at
- Any page displaying `created_at` or `updated_at` timestamp fields from SQLite

### Sub-Issue: Calendar Not Displaying General Journals

**Problem:**
General journals were not appearing on the calendar page, only daily journals were showing up. The calendar remained empty on dates when general journals were created.

**Root Cause:**
The calendar integration code in `lib/db/calendar.ts` was extracting the date from `created_at` timestamps using only `.split('T')[0]`, which works for ISO format (`YYYY-MM-DDTHH:MM:SS`) but not for SQLite TIMESTAMP format (`YYYY-MM-DD HH:MM:SS`). When a general journal's `created_at` was `2025-11-14 18:12:55`, the code would try to use the entire timestamp string as a date key instead of just `2025-11-14`, causing the calendar lookup to fail.

**Example of the Bug:**
```typescript
// SQLite timestamp
const timestamp = "2025-11-14 18:12:55";

// OLD CODE - Only splits on "T"
dateStr = journal.created_at.split('T')[0];
// Result: "2025-11-14 18:12:55" (unchanged)

// Calendar tries to find day with key "2025-11-14 18:12:55"
const dayData = calendarMap.get(dateStr); // Returns undefined
// Journal is never added to calendar
```

**Solution:**
Updated the journal mapping code in `getCalendarDataForRange()` to split on both "T" and space characters:

```typescript
// CORRECT - Handles both ISO and SQLite timestamp formats
dateStr = journal.created_at.split('T')[0].split(' ')[0];
// For "2025-11-14 18:12:55": Returns "2025-11-14"
// For "2025-11-14T18:12:55": Returns "2025-11-14"
// Calendar correctly finds day with key "2025-11-14"
```

**Files Fixed:**
- `lib/db/calendar.ts` - Fixed general journal date extraction in `getCalendarDataForRange()`

**Prevention:**
- When extracting dates from timestamp fields for calendar display or date-based grouping, always use `.split('T')[0].split(' ')[0]` to handle both formats
- Test calendar integration with actual database data that uses SQLite TIMESTAMP format
- Verify both daily and general journals appear on the calendar after creation

**Related Components:**
- `components/widgets/calendar-day-cell.tsx` - Displays journals on calendar grid
- `components/widgets/calendar-day-detail.tsx` - Displays journals in daily detail view
- `app/(dashboard)/calendar/page.tsx` - Calendar page that shows journals

---

## Future Issues

Add new issues here following the same format:
1. Clear description of the problem
2. Root cause analysis
3. Code examples showing the bug
4. Solution with code examples
5. Files affected
6. Prevention guidelines
7. Detection methods
