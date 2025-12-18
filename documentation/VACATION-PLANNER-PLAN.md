# Vacation Planner Implementation Plan

## Overview
Implement a **mid-level vacation planning and tracking feature** that allows users to:
- Plan and track vacations with dates, destinations, and metadata
- Create day-by-day itineraries with activities
- Manage bookings (flights, hotels, activities) with confirmations
- View vacations in a year-based timeline
- Track budget (planned vs actual)

**Complexity Level**: Mid-level (between simple tracker and full trip planner)
**Key Features**: Day-by-day itinerary, booking management, timeline view, budget tracking

## Research Findings

### Vacation Planning App Features (2025)
From market research, modern vacation apps include:
- **Day-by-day itineraries** with activities, locations, and notes
- **Booking management** (flights, hotels, activities) with confirmation numbers and providers
- **Budget tracking** with planned vs actual spending
- **Timeline/calendar views** for visualizing trips
- **Auto-calculating trip duration** from dates
- **Status tracking** (planning, booked, in-progress, completed)
- **Photos/posters** for each trip
- **Collaborative features** (deferred for v1)
- **Packing lists** (deferred for v1)

### Codebase Patterns to Follow
- **Parks feature** - Closest match (slug routing, markdown content, ratings, tags)
- **Media feature** - Timeline visualization patterns
- **Meals feature** - Related entities pattern (ingredients = itinerary days/bookings)

---

## Database Schema

### Table 1: `vacations` (Main vacation metadata)
```sql
CREATE TABLE IF NOT EXISTS vacations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date TEXT NOT NULL, -- YYYY-MM-DD
  end_date TEXT NOT NULL,   -- YYYY-MM-DD
  description TEXT,
  poster TEXT,
  status TEXT CHECK(status IN ('planning', 'booked', 'in-progress', 'completed', 'cancelled')) DEFAULT 'planning',
  budget_planned REAL,
  budget_actual REAL,
  budget_currency TEXT DEFAULT 'USD',
  tags TEXT, -- JSON array
  rating REAL CHECK(rating >= 0 AND rating <= 10),
  featured INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1,
  content TEXT, -- Markdown trip notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, slug)
);

CREATE INDEX IF NOT EXISTS idx_vacations_userId ON vacations(userId);
CREATE INDEX IF NOT EXISTS idx_vacations_slug ON vacations(slug);
CREATE INDEX IF NOT EXISTS idx_vacations_start_date ON vacations(start_date);
CREATE INDEX IF NOT EXISTS idx_vacations_status ON vacations(status);

CREATE TRIGGER IF NOT EXISTS update_vacations_timestamp
AFTER UPDATE ON vacations
BEGIN
  UPDATE vacations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

### Table 2: `vacation_itinerary_days` (Day-by-day planning)
```sql
CREATE TABLE IF NOT EXISTS vacation_itinerary_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vacationId INTEGER NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  day_number INTEGER NOT NULL, -- 1, 2, 3... (computed from start_date)
  title TEXT,
  location TEXT,
  activities TEXT, -- JSON array of activity strings
  notes TEXT, -- Markdown
  budget_planned REAL,
  budget_actual REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vacationId) REFERENCES vacations(id) ON DELETE CASCADE,
  UNIQUE(vacationId, date)
);

CREATE INDEX IF NOT EXISTS idx_vacation_itinerary_days_vacationId ON vacation_itinerary_days(vacationId);
CREATE INDEX IF NOT EXISTS idx_vacation_itinerary_days_date ON vacation_itinerary_days(date);

CREATE TRIGGER IF NOT EXISTS update_vacation_itinerary_days_timestamp
AFTER UPDATE ON vacation_itinerary_days
BEGIN
  UPDATE vacation_itinerary_days SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

### Table 3: `vacation_bookings` (Flights, hotels, activities)
```sql
CREATE TABLE IF NOT EXISTS vacation_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vacationId INTEGER NOT NULL,
  type TEXT CHECK(type IN ('flight', 'hotel', 'activity', 'car', 'train', 'other')) NOT NULL,
  title TEXT NOT NULL,
  date TEXT, -- YYYY-MM-DD
  start_time TEXT, -- HH:MM
  end_time TEXT, -- HH:MM
  confirmation_number TEXT,
  provider TEXT, -- Airline, hotel name, tour company
  location TEXT,
  cost REAL,
  status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  url TEXT, -- Link to confirmation
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vacationId) REFERENCES vacations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vacation_bookings_vacationId ON vacation_bookings(vacationId);
CREATE INDEX IF NOT EXISTS idx_vacation_bookings_type ON vacation_bookings(type);
CREATE INDEX IF NOT EXISTS idx_vacation_bookings_date ON vacation_bookings(date);

CREATE TRIGGER IF NOT EXISTS update_vacation_bookings_timestamp
AFTER UPDATE ON vacation_bookings
BEGIN
  UPDATE vacation_bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

---

## Type Definitions (`lib/types/vacations.ts`)

```typescript
export type VacationStatus = 'planning' | 'booked' | 'in-progress' | 'completed' | 'cancelled';
export type BookingType = 'flight' | 'hotel' | 'activity' | 'car' | 'train' | 'other';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Vacation {
  id: number;
  userId: string;
  slug: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  description: string | null;
  poster: string | null;
  status: VacationStatus;
  budget_planned: number | null;
  budget_actual: number | null;
  budget_currency: string;
  tags: string[]; // Parsed from JSON
  rating: number | null;
  featured: boolean; // Parsed from 0/1
  published: boolean; // Parsed from 0/1
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface VacationInput {
  slug: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  description?: string;
  poster?: string;
  status?: VacationStatus;
  budget_planned?: number;
  budget_actual?: number;
  budget_currency?: string;
  tags?: string[];
  rating?: number;
  featured?: boolean;
  published?: boolean;
  content?: string;
}

export interface ItineraryDay {
  id: number;
  vacationId: number;
  date: string;
  day_number: number;
  title: string | null;
  location: string | null;
  activities: string[]; // Parsed from JSON
  notes: string | null;
  budget_planned: number | null;
  budget_actual: number | null;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDayInput {
  date: string;
  day_number: number;
  title?: string;
  location?: string;
  activities?: string[];
  notes?: string;
  budget_planned?: number;
  budget_actual?: number;
}

export interface Booking {
  id: number;
  vacationId: number;
  type: BookingType;
  title: string;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  confirmation_number: string | null;
  provider: string | null;
  location: string | null;
  cost: number | null;
  status: BookingStatus;
  notes: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingInput {
  type: BookingType;
  title: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  confirmation_number?: string;
  provider?: string;
  location?: string;
  cost?: number;
  status?: BookingStatus;
  notes?: string;
  url?: string;
}

export interface VacationWithDetails {
  vacation: Vacation;
  itinerary: ItineraryDay[];
  bookings: Booking[];
}
```

---

## Database Functions (`lib/db/vacations.ts`)

### Vacation CRUD
```typescript
export async function createVacation(data: VacationInput, userId: string): Promise<Vacation>
export async function getVacationById(id: number, userId: string): Promise<Vacation | undefined>
export async function getVacationBySlug(slug: string, userId: string): Promise<Vacation | undefined>
export async function getAllVacations(userId: string): Promise<Vacation[]>
export async function getVacationsByYear(year: number, userId: string): Promise<Vacation[]>
export async function getVacationWithDetails(slug: string, userId: string): Promise<VacationWithDetails | undefined>
export async function updateVacation(id: number, userId: string, data: Partial<VacationInput>): Promise<boolean>
export async function deleteVacation(id: number, userId: string): Promise<boolean>
```

### Itinerary CRUD
```typescript
export async function createItineraryDay(vacationId: number, data: ItineraryDayInput): Promise<ItineraryDay>
export async function getItineraryDays(vacationId: number): Promise<ItineraryDay[]>
export async function updateItineraryDay(id: number, vacationId: number, data: Partial<ItineraryDayInput>): Promise<boolean>
export async function deleteItineraryDay(id: number, vacationId: number): Promise<boolean>
```

### Booking CRUD
```typescript
export async function createBooking(vacationId: number, data: BookingInput): Promise<Booking>
export async function getBookings(vacationId: number): Promise<Booking[]>
export async function updateBooking(id: number, vacationId: number, data: Partial<BookingInput>): Promise<boolean>
export async function deleteBooking(id: number, vacationId: number): Promise<boolean>
```

### Helper Functions
```typescript
function parseVacation(dbRow: any): Vacation // Parse JSON fields and booleans
function calculateDurationDays(start_date: string, end_date: string): number
function calculateDayNumber(vacationStartDate: string, dayDate: string): number
```

---

## API Routes

### Main Vacation Routes
- **POST /api/vacations** - Create vacation (supports nested itinerary/bookings)
- **GET /api/vacations** - List all vacations
- **GET /api/vacations/[slug]** - Get vacation with details
- **PATCH /api/vacations/[slug]** - Update vacation metadata
- **DELETE /api/vacations/[slug]** - Delete vacation (cascades)

### Itinerary Routes
- **POST /api/vacations/[slug]/itinerary** - Add itinerary day
- **PATCH /api/vacations/[slug]/itinerary/[id]** - Update itinerary day
- **DELETE /api/vacations/[slug]/itinerary/[id]** - Delete itinerary day

### Booking Routes
- **POST /api/vacations/[slug]/bookings** - Add booking
- **PATCH /api/vacations/[slug]/bookings/[id]** - Update booking
- **DELETE /api/vacations/[slug]/bookings/[id]** - Delete booking

---

## Page Structure

```
app/(dashboard)/vacations/
├── page.tsx                 # List page with year grouping
├── page-client.tsx          # Client wrapper with filters
├── loading.tsx              # Loading skeleton
├── new/
│   └── page.tsx            # Create vacation form
└── [slug]/
    ├── page.tsx            # Vacation detail (tabs: Overview, Itinerary, Bookings)
    ├── edit/
    │   └── page.tsx        # Edit vacation
    └── loading.tsx
```

---

## Component Architecture

### Core Components (`components/widgets/vacations/`)

1. **vacation-card.tsx** - Card for list view
   - Display: title, destination, dates, status badge, budget, poster
   - Actions: View, Edit buttons

2. **vacation-editor.tsx** - Main create/edit form (similar to ParkEditor)
   - Tabs: Metadata, Itinerary, Bookings, Content
   - Metadata: title, destination, dates, budget, tags, rating, poster
   - Success feedback: `showCreationSuccess('vacation', { persistent: true })`
   - Follow park-editor pattern with drag-and-drop markdown import

3. **itinerary-section.tsx** - Day-by-day itinerary manager
   - Display days as timeline cards
   - Add/edit/delete days inline
   - Auto-generate empty days from date range
   - Each day shows: day number, date, title, location, activities, notes

4. **booking-section.tsx** - Booking management
   - Group by type (flights, hotels, activities)
   - Display as cards with type icon and status badge
   - Quick add booking button
   - Show confirmation numbers prominently

5. **vacation-detail-tabs.tsx** - Tab navigation for detail view
   - Overview: Summary, dates, budget tracker, poster, markdown content
   - Itinerary: Day-by-day plan
   - Bookings: All reservations

6. **budget-tracker.tsx** - Budget visualization
   - Use AnimatedProgress component
   - Show planned vs actual at vacation level
   - Breakdown by itinerary days and bookings

7. **vacation-year-groups.tsx** - Year-based grouping for list page
   - Group vacations by year (extract from start_date)
   - Collapsible sections per year
   - Show count and total days per year

### Shared UI Components
- `Button` from `@/components/ui/button` (NOT native `<button>`)
- `Card`, `Badge`, `Input`, `Textarea`, `Select`, `Tabs`
- `AnimatedProgress` for budget tracking
- `TagInput` for tag management

---

## Implementation Sequence

### Phase 1: Database Foundation (Days 1-2)
1. ✅ Add schema to `lib/db/schema.sql`
2. ✅ Create `lib/types/vacations.ts` with all types
3. ✅ Implement `lib/db/vacations.ts` with all CRUD functions
4. ✅ Test database functions

### Phase 2: API Layer (Days 3-4)
5. ✅ Create `app/api/vacations/route.ts` (GET, POST)
6. ✅ Create `app/api/vacations/[slug]/route.ts` (GET, PATCH, DELETE)
7. ✅ Create nested routes for itinerary and bookings
8. ✅ Test all endpoints with auth

### Phase 3: List & Timeline View (Days 5-6)
9. ✅ Create `VacationCard` component
10. ✅ Create `VacationYearGroups` component
11. ✅ Build `/vacations/page.tsx` (server component)
12. ✅ Build `/vacations/page-client.tsx` (filtering, search)

### Phase 4: Detail View (Days 7-8)
13. ✅ Create `VacationDetailTabs` component
14. ✅ Create `ItinerarySection` component
15. ✅ Create `BookingSection` component
16. ✅ Create `BudgetTracker` component
17. ✅ Build `/vacations/[slug]/page.tsx`

### Phase 5: Create/Edit Flow (Days 9-11)
18. ✅ Create `VacationEditor` component (base on ParkEditor)
19. ✅ Build `/vacations/new/page.tsx`
20. ✅ Build `/vacations/[slug]/edit/page.tsx`
21. ✅ Implement nested create support (vacation + itinerary + bookings)

### Phase 6: Polish & Features (Days 12-13)
22. ✅ Add loading states
23. ✅ Error handling and validation
24. ✅ Success/error feedback (toasts)
25. ✅ Mobile responsiveness
26. ✅ Budget calculations and aggregations

### Phase 7: Testing & Documentation (Day 14)
27. ✅ Manual testing all flows
28. ✅ Fix bugs
29. ✅ Update navigation/menu
30. ✅ Documentation

---

## Key Design Decisions

### 1. Separate Itinerary and Bookings
- **Itinerary**: What you plan to do each day (activities, locations)
- **Bookings**: Specific reservations (flights, hotels) independent of daily plans
- Allows flexibility: bookings without detailed itinerary, or itinerary without bookings

### 2. Budget Tracking at Multiple Levels
- Vacation level: Overall planned vs actual
- Itinerary day level: Daily spending
- Booking level: Individual costs
- Frontend aggregates for comprehensive view

### 3. Status Progression
- `planning` → Initial brainstorming
- `booked` → Reservations confirmed
- `in-progress` → Currently on trip
- `completed` → Trip finished
- `cancelled` → Cancelled plans

### 4. Timeline Display
- Group vacations by year (from `start_date`)
- Collapsible year sections
- Sort by date within each year
- Show stats per year (count, total days)

### 5. Auto-Calculations
- Trip duration: `end_date - start_date + 1`
- Day numbers: Days since `start_date`
- Budget totals: Sum of bookings and itinerary actuals

---

## Critical Files

1. **lib/db/schema.sql** - Add 3 new tables
2. **lib/db/vacations.ts** - All database operations
3. **lib/types/vacations.ts** - TypeScript interfaces
4. **app/api/vacations/route.ts** - Main API endpoint
5. **components/widgets/vacations/vacation-editor.tsx** - Primary UI component

---

## Success Criteria

✅ Users can create vacations with dates and destinations
✅ Day-by-day itinerary planning works
✅ Booking management (flights, hotels, activities) functional
✅ Timeline view groups vacations by year
✅ Budget tracking shows planned vs actual
✅ Detail view has tabs (Overview, Itinerary, Bookings)
✅ All CRUD operations work with proper auth
✅ Success feedback on creation
✅ Mobile responsive
✅ Follows all codebase patterns (Button, success toasts, etc.)

---

## Future Enhancements (Out of Scope for V1)

- Packing lists
- Expense tracking by category
- Multi-destination trips
- Photo galleries
- Weather integration
- Sharing/collaboration
- Export to calendar (iCal)
- Map view
- Achievement integration
