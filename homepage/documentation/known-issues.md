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
This issue affects any date field stored in `YYYY-MM-DD` format:
- `media_content.completed` - Media completion dates
- `media_content.started` - Media start dates
- `media_content.released` - Media release dates
- `events.date` - Event dates
- `events.end_date` - Event end dates
- `tasks.due_date` - Task due dates
- `tasks.completed_date` - Task completion dates
- `strava_activities.start_date_local` - Activity dates
- `mood_entries.date` - Mood entry dates

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
