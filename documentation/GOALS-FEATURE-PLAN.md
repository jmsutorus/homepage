# Goals Feature Implementation Plan

## Overview

A full-featured Goals system with milestones, checklists, markdown notes, and progress tracking. Users can define goals with end dates, write markdown notes, organize with tags, and break down goals into milestones with their own checklists.

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Categories | Use existing tags system | Reuse cross-entity tag system already in place |
| Statuses | Extended | Not Started, In Progress, On Hold, Completed, Archived, Abandoned |
| Milestone Notes | Title + checklist only | Keep milestones lightweight |
| Edit View | Full page editor | Dedicated /goals/[slug] page like journals |

---

## Database Schema

Add to `lib/db/schema.sql`:

### 1. `goals` table

```sql
CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- Markdown notes
  status TEXT CHECK(status IN ('not_started', 'in_progress', 'on_hold', 'completed', 'archived', 'abandoned')) DEFAULT 'not_started',
  target_date TEXT, -- YYYY-MM-DD
  completed_date TEXT, -- YYYY-MM-DD
  tags TEXT, -- JSON array
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, slug)
);

CREATE TRIGGER IF NOT EXISTS goals_updated_at
AFTER UPDATE ON goals
FOR EACH ROW
BEGIN
  UPDATE goals SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
```

### 2. `goal_milestones` table

```sql
CREATE TABLE IF NOT EXISTS goal_milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goalId INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date TEXT, -- YYYY-MM-DD, must be <= parent goal target_date
  completed INTEGER DEFAULT 0,
  completed_date TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS goal_milestones_updated_at
AFTER UPDATE ON goal_milestones
FOR EACH ROW
BEGIN
  UPDATE goal_milestones SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
```

### 3. `goal_checklist_items` table

```sql
CREATE TABLE IF NOT EXISTS goal_checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goalId INTEGER, -- For goal-level checklists
  milestoneId INTEGER, -- For milestone-level checklists
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE,
  FOREIGN KEY (milestoneId) REFERENCES goal_milestones(id) ON DELETE CASCADE,
  CHECK (goalId IS NOT NULL OR milestoneId IS NOT NULL)
);

CREATE TRIGGER IF NOT EXISTS goal_checklist_items_updated_at
AFTER UPDATE ON goal_checklist_items
FOR EACH ROW
BEGIN
  UPDATE goal_checklist_items SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
```

---

## Files to Create

### Database Layer

| File | Description |
|------|-------------|
| `lib/db/goals.ts` | CRUD operations for goals, milestones, checklist items |

### Server Actions

| File | Description |
|------|-------------|
| `lib/actions/goals.ts` | Server actions for all goal operations |

### API Routes

| File | Description |
|------|-------------|
| `app/api/goals/route.ts` | GET (list all), POST (create) |
| `app/api/goals/[id]/route.ts` | GET, PATCH, DELETE single goal |
| `app/api/goals/[id]/milestones/route.ts` | Milestone CRUD |
| `app/api/goals/[id]/checklist/route.ts` | Goal-level checklist CRUD |
| `app/api/milestones/[id]/checklist/route.ts` | Milestone-level checklist CRUD |

### Pages

| File | Description |
|------|-------------|
| `app/(dashboard)/goals/page.tsx` | Goals list page |
| `app/(dashboard)/goals/new/page.tsx` | Create new goal |
| `app/(dashboard)/goals/[slug]/page.tsx` | View goal detail |
| `app/(dashboard)/goals/[slug]/edit/page.tsx` | Edit goal (full editor) |

### Components (`components/widgets/goals/`)

| File | Description |
|------|-------------|
| `goal-card.tsx` | Card showing goal summary with progress indicator |
| `goals-list.tsx` | List of goal cards with filters/sorting |
| `goal-editor.tsx` | Full markdown editor (similar to journal-editor) |
| `milestone-list.tsx` | Inline milestone management with drag-reorder |
| `milestone-form.tsx` | Add/edit milestone dialog |
| `checklist.tsx` | Reusable checklist component for goals/milestones |
| `goal-progress.tsx` | Progress visualization (AnimatedProgressRing) |
| `goal-status-badge.tsx` | Status indicator badge with color coding |

---

## Feature Specifications

### Goals List Page (`/goals`)

**Features:**
- Filter by status (dropdown with all 6 statuses)
- Filter by tags (using existing TagInput)
- Filter by priority
- Sort by: target date, progress %, created date, title
- Progress indicators showing milestone/checklist completion
- Quick actions: mark complete, archive, delete

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Goals                              [+ New Goal]     │
│ Track your long-term objectives                     │
├─────────────────────────────────────────────────────┤
│ [Status ▼] [Tags ▼] [Priority ▼]    [Sort by ▼]    │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🎯 Goal Title                    [75%] ████░░   │ │
│ │ Short description...                            │ │
│ │ 📅 Dec 31, 2025  🏷️ career, learning           │ │
│ │ [In Progress]  3/4 milestones                   │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ...more goal cards...                           │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Goal Editor (`/goals/new` & `/goals/[slug]/edit`)

**Tab Structure:**
1. **Details Tab** - Basic goal information
   - Title (required)
   - Short description
   - Target date picker (Calendar component)
   - Priority selector (low/medium/high)
   - Status selector (6 options)
   - Tags (TagInput component with autocomplete)

2. **Content Tab** - Markdown editor
   - Markdown toolbar (H1, H2, Bold, Italic, List, Link, Code)
   - Large textarea with monospace font
   - Live preview toggle

3. **Milestones Tab** - Milestone management
   - Add milestone button
   - Draggable milestone list
   - Each milestone shows:
     - Title, description, target date
     - Completion checkbox
     - Inline checklist items
     - Edit/Delete actions

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Goals                                     │
│ Create New Goal / Edit: [Goal Title]                │
├─────────────────────────────────────────────────────┤
│ [Details] [Content] [Milestones]        [Save]      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Tab content here...                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Goal Detail View (`/goals/[slug]`)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Goals                          [Edit]     │
├─────────────────────────────────────────────────────┤
│ Goal Title                                          │
│ [In Progress] [High Priority]                       │
│                                                     │
│ ┌──────────────┐  ┌────────────────────────────────┐│
│ │   Progress   │  │ Details                        ││
│ │    ┌───┐     │  │ 📅 Target: Dec 31, 2025       ││
│ │    │75%│     │  │ 🏷️ career, learning, growth  ││
│ │    └───┘     │  │ ⏱️ Created: Jan 1, 2025       ││
│ └──────────────┘  └────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│ Milestones (3/4 completed)                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ✅ Research phase          Due: Feb 15          │ │
│ │ ✅ Planning complete       Due: Mar 1           │ │
│ │ 🔲 Implementation          Due: Jun 30          │ │
│ │    └─ [ ] Task 1  [ ] Task 2  [✓] Task 3       │ │
│ │ 🔲 Final review            Due: Dec 15          │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ Goal Checklist (5/8 items)                          │
│ [✓] Item 1  [✓] Item 2  [ ] Item 3  ...            │
├─────────────────────────────────────────────────────┤
│ Notes                                               │
│ ─────────────────────────────────────────────────── │
│ Rendered markdown content here...                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Progress Calculation

Goal progress is calculated as a weighted combination:

```typescript
function calculateGoalProgress(goal: Goal, milestones: Milestone[], checklists: ChecklistItem[]): number {
  const goalChecklist = checklists.filter(c => c.goalId === goal.id && !c.milestoneId);
  const goalChecklistProgress = goalChecklist.length > 0
    ? goalChecklist.filter(c => c.completed).length / goalChecklist.length
    : 1;

  if (milestones.length === 0) {
    return goalChecklistProgress * 100;
  }

  const milestoneProgress = milestones.filter(m => m.completed).length / milestones.length;

  // Weight: 70% milestones, 30% goal checklist
  return ((milestoneProgress * 0.7) + (goalChecklistProgress * 0.3)) * 100;
}
```

---

## TypeScript Interfaces

```typescript
// lib/db/goals.ts

export type GoalStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'archived' | 'abandoned';
export type GoalPriority = 'low' | 'medium' | 'high';

export interface Goal {
  id: number;
  userId: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  status: GoalStatus;
  target_date: string | null;
  completed_date: string | null;
  tags: string[];
  priority: GoalPriority;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: number;
  goalId: number;
  title: string;
  description: string | null;
  target_date: string | null;
  completed: boolean;
  completed_date: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface GoalChecklistItem {
  id: number;
  goalId: number | null;
  milestoneId: number | null;
  text: string;
  completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Extended types for UI
export interface GoalWithProgress extends Goal {
  milestones: GoalMilestone[];
  checklist: GoalChecklistItem[];
  progress: number;
}
```

---

## Implementation Order

### Phase 1: Foundation
1. Add database schema to `lib/db/schema.sql`
2. Create `lib/db/goals.ts` with CRUD functions
3. Create `lib/actions/goals.ts` server actions

### Phase 2: API Layer
4. Create API routes for goals CRUD
5. Create API routes for milestones CRUD
6. Create API routes for checklist CRUD

### Phase 3: Basic UI
7. Create `goal-status-badge.tsx` component
8. Create `goal-card.tsx` component
9. Create `goals-list.tsx` component
10. Create `/goals` page with basic list view

### Phase 4: Editor
11. Create `checklist.tsx` reusable component
12. Create `milestone-form.tsx` dialog
13. Create `milestone-list.tsx` component
14. Create `goal-editor.tsx` full editor
15. Create `/goals/new` page
16. Create `/goals/[slug]/edit` page

### Phase 5: Detail View
17. Create `goal-progress.tsx` component
18. Create `/goals/[slug]` detail page

### Phase 6: Polish
19. Add animations (AnimatePresence, page transitions)
20. Add success feedback (SuccessCheck for create, toasts for updates)
21. Add form validation (Zod schemas)
22. Add keyboard shortcuts
23. Add empty states and loading skeletons

---

## Reference Files

| Aspect | Reference File |
|--------|---------------|
| Database Schema | `lib/db/schema.sql` |
| DB Functions Pattern | `lib/db/habits.ts`, `lib/db/tasks.ts` |
| Server Actions Pattern | `lib/actions/habits.ts` |
| API Routes Pattern | `app/api/tasks/route.ts` |
| Page Layout Pattern | `app/(dashboard)/habits/page.tsx` |
| Full Editor Pattern | `components/widgets/journal/journal-editor.tsx` |
| Tags Integration | `components/search/tag-input.tsx` |
| Progress Components | `components/ui/animations/animated-progress.tsx` |
| Success Feedback | `documentation/SUCCESS-FEEDBACK-GUIDE.md` |
