# Success Feedback Implementation Guide

This guide provides comprehensive instructions for implementing success feedback when users create new entities in the application. Following these patterns ensures a consistent, delightful user experience across all creation actions.

## Table of Contents

1. [Overview](#overview)
2. [Decision Tree](#decision-tree)
3. [Available Tools](#available-tools)
4. [Implementation Patterns](#implementation-patterns)
5. [Integration Checklist](#integration-checklist)
6. [Common Pitfalls](#common-pitfalls)
7. [Examples](#examples)

---

## Overview

Success feedback improves user experience by:
- **Confirming actions** - Users know their creation succeeded
- **Providing delight** - Animations and messages celebrate accomplishments
- **Preventing confusion** - Clear feedback reduces uncertainty
- **Maintaining context** - Persistent toasts keep users informed during navigation

### Three Success Feedback Patterns

1. **SuccessCheck Animation** - For important, celebratory actions (habits, moods, activities)
2. **Toast Notifications** - For quick, frequent actions (tasks, events, links)
3. **Persistent Toasts** - For full-page editors that navigate away (journals, media, parks)

---

## Decision Tree

Use this flowchart to choose the right success feedback pattern:

```
Is this a creation action?
├─ NO → No success feedback needed
└─ YES → Continue...
    │
    Does it navigate to a new page after creation?
    ├─ YES → Use **Persistent Toast** (Pattern 3)
    └─ NO → Continue...
        │
        Is it an important/celebratory action?
        ├─ YES → Use **SuccessCheck Animation** (Pattern 1)
        └─ NO → Use **Toast Notification** (Pattern 2)
```

### Pattern Selection Examples

| Action | Pattern | Reasoning |
|--------|---------|-----------|
| Create Habit | SuccessCheck Animation | Important user commitment, worthy of celebration |
| Log Activity | SuccessCheck Animation | Significant accomplishment, encourages continued use |
| Track Mood | SuccessCheck Animation | Emotional check-in, deserves acknowledgment |
| Add Task | Toast Notification | Quick, frequent action |
| Create Event | Toast Notification | Standard calendar operation |
| Add Link | Toast Notification | Utility action, happens frequently |
| Save Journal | Persistent Toast | Navigates to detail page, toast persists |
| Create Media Entry | Persistent Toast | Navigates to detail page, toast persists |
| Record Park Visit | Persistent Toast | Navigates to detail page, toast persists |

---

## Available Tools

### 1. Success Animation Component (`SuccessAnimation`)

Located: `components/ui/animations/success-variants.tsx`

```tsx
import { SuccessAnimation } from "@/components/ui/animations/success-variants";

// Usage
<SuccessAnimation variant="check" size={120} />
```

**Variants:**
- `check` - Animated checkmark (default, most common)
- `star` - Shining star (for special achievements)
- `confetti` - Celebratory burst (for major milestones)
- `ripple` - Ripple effect (for calm acknowledgments)

**Backward Compatibility:**
```tsx
// Original SuccessCheck still works
import { SuccessCheck } from "@/components/ui/animations/success-check";
```

### 2. useSuccessDialog Hook

Located: `hooks/use-success-dialog.ts`

```tsx
import { useSuccessDialog } from "@/hooks/use-success-dialog";

const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
  duration: 2000, // ms to display success state
  onClose: () => {
    // Called after success display completes
    onOpenChange(false);
  },
});
```

**Returns:**
- `showSuccess` - Boolean state to conditionally render success content
- `triggerSuccess()` - Call to start success animation
- `resetSuccess()` - Reset state (useful for cleanup)
- `isTransitioning` - Boolean for intermediate loading state

### 3. Success Toast Helpers

Located: `lib/success-toasts.ts`

```tsx
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";

// Success
showCreationSuccess("task");
showCreationSuccess("task", {
  message: "Custom message",
  description: "Additional details",
  duration: 3000,
  persistent: false
});

// Error
showCreationError("task", error);
showCreationError("task", error, {
  message: "Custom error message"
});
```

**Supported Entity Types:**
`habit`, `task`, `event`, `mood`, `activity`, `journal`, `media`, `park`, `category`, `link`

---

## Implementation Patterns

### Pattern 1: SuccessCheck Animation (Dialog/Modal)

**Use for:** Important, celebratory creation actions in dialogs

**Step-by-Step:**

1. **Import dependencies:**
```tsx
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
```

2. **Add useSuccessDialog hook:**
```tsx
const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
  duration: 2000,
  onClose: () => {
    setIsModalOpen(false);
    onActivityAdded?.(); // Optional callback
  },
});
```

3. **Add cleanup effect:**
```tsx
useEffect(() => {
  if (!isModalOpen) {
    resetSuccess();
  }
}, [isModalOpen, resetSuccess]);
```

4. **Trigger success in submit handler:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch("/api/...", { method: "POST", ... });

    if (!response.ok) {
      throw new Error("Failed to create");
    }

    resetForm();
    triggerSuccess(); // Show success animation
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to create. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

5. **Conditionally render success content:**
```tsx
<DialogContent>
  {showSuccess ? (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <SuccessCheck size={120} />
      <h3 className="text-2xl font-semibold text-green-500">Success!</h3>
      <p className="text-muted-foreground text-center">
        Motivational message here
      </p>
    </div>
  ) : (
    <>
      <DialogHeader>...</DialogHeader>
      <form>...</form>
    </>
  )}
</DialogContent>
```

**Important Notes:**
- Only show for **create** actions, not edits
- Customize the success message to the entity type
- Use fade-in animation classes for smooth transitions

**Reference Implementation:** `components/widgets/habits/create-habit-form.tsx`

---

### Pattern 2: Toast Notifications (Quick Actions)

**Use for:** Frequent, utility-focused creation actions

**Step-by-Step:**

1. **Import helper:**
```tsx
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";
```

2. **Add toast calls in submit handler:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData }),
    });

    if (response.ok) {
      resetForm();
      showCreationSuccess("task"); // Show toast
      onTaskAdded();
    } else {
      throw new Error("Failed to create task");
    }
  } catch (error) {
    console.error("Failed to create task:", error);
    showCreationError("task", error); // Show error toast
  } finally {
    setLoading(false);
  }
};
```

**Important Notes:**
- Toast appears briefly (3 seconds by default)
- Form closes immediately after toast shows
- Only show for **create** actions, not edits (check with `if (!event)` or similar)

**Reference Implementations:**
- `components/widgets/tasks/task-form.tsx`
- `components/widgets/calendar/event-modal.tsx`
- `components/widgets/quick-links/quick-links-editor.tsx`

---

### Pattern 3: Persistent Toasts (Full-Page Editors)

**Use for:** Creation actions that navigate to a detail page

**Step-by-Step:**

1. **Import helper:**
```tsx
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";
```

2. **Add persistent toast before navigation:**
```tsx
const handleSave = async (e: FormEvent) => {
  e.preventDefault();
  setIsSaving(true);

  try {
    const response = await fetch("/api/journals", {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frontmatter, content }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to save");
    }

    // Show persistent toast for create mode ONLY
    if (mode === "create") {
      showCreationSuccess("journal", { persistent: true });
    }

    // Navigate to detail page
    router.push(data.path);
    router.refresh();
  } catch (err) {
    setError(err instanceof Error ? err.message : "An error occurred");
    showCreationError("journal", err);
    setIsSaving(false);
  }
};
```

**Important Notes:**
- Use `persistent: true` option for toasts that survive navigation
- Only show for **create** mode, not edit mode
- Toast remains visible on the new page until user dismisses it
- No need for auto-dismiss timing

**Reference Implementations:**
- `components/widgets/journal/journal-editor.tsx`
- `components/widgets/media/media-editor.tsx`
- `components/widgets/parks/park-editor.tsx`

---

## Integration Checklist

Use this checklist when adding success feedback to a new creation action:

### Before Implementation

- [ ] Identify the creation action (form, dialog, editor, etc.)
- [ ] Determine if it creates or edits (only show success for creates)
- [ ] Choose the appropriate pattern using the [Decision Tree](#decision-tree)
- [ ] Review reference implementation for the chosen pattern

### During Implementation

- [ ] Import necessary dependencies
- [ ] Add success state management (hook or direct toast call)
- [ ] Update submit/save handler to trigger success feedback
- [ ] Add error handling with error toast (where applicable)
- [ ] Conditionally render success content (for animations)
- [ ] Add cleanup effects (for dialog animations)

### After Implementation

- [ ] Test create action - verify success feedback appears
- [ ] Test edit action - verify NO success feedback appears
- [ ] Test error scenarios - verify error toast appears
- [ ] Test timing - verify auto-dismiss works correctly
- [ ] Check animations - ensure smooth transitions
- [ ] Verify accessibility - screen readers announce feedback
- [ ] Test on mobile - ensure toasts are visible and readable

### Code Quality

- [ ] Remove console.log statements
- [ ] Follow existing code style and conventions
- [ ] Add comments for complex logic
- [ ] Ensure imports are organized
- [ ] No duplicate imports

---

## Common Pitfalls

### 1. Showing Success Feedback for Edit Actions

**Problem:** Success animation/toast appears when editing existing entities

**Solution:** Check mode before showing feedback
```tsx
// ❌ Wrong - shows for both create and edit
triggerSuccess();

// ✅ Correct - only for create
if (mode === "create") {
  showCreationSuccess("journal", { persistent: true });
}

// ✅ Correct - check for absence of edit identifier
if (!event) {
  showCreationSuccess("event");
}
```

### 2. Not Resetting Success State

**Problem:** Success animation shows when reopening dialog

**Solution:** Reset state when dialog closes
```tsx
useEffect(() => {
  if (!open) {
    resetSuccess();
  }
}, [open, resetSuccess]);
```

### 3. Missing Error Feedback

**Problem:** Users don't know when creation fails

**Solution:** Always add error toast in catch block
```tsx
try {
  // ... creation logic
} catch (error) {
  showCreationError("task", error);
}
```

### 4. Using Wrong Pattern

**Problem:** Full-page editor uses regular toast (disappears during navigation)

**Solution:** Use persistent toast for navigating editors
```tsx
// ❌ Wrong - toast disappears during navigation
showCreationSuccess("journal");
router.push(path);

// ✅ Correct - persistent toast survives navigation
showCreationSuccess("journal", { persistent: true });
router.push(path);
```

### 5. Animation Appears During Edit

**Problem:** Success animation appears when editing

**Solution:** Only trigger for create operations
```tsx
// In edit/create hybrid modals
if (isEditing) {
  setIsModalOpen(false);
  onActivityAdded?.();
} else {
  triggerSuccess(); // Only for creates
}
```

### 6. Missing Form Reset

**Problem:** Form keeps old values after success

**Solution:** Reset form before triggering success
```tsx
resetForm();        // Clear form first
triggerSuccess();   // Then show success
```

### 7. Incorrect Entity Type

**Problem:** Using wrong entity name in toast calls

**Solution:** Use exact entity type from success-toasts.ts
```tsx
// ❌ Wrong
showCreationSuccess("tasks"); // plural
showCreationSuccess("todo");  // wrong name

// ✅ Correct
showCreationSuccess("task");
```

---

## Examples

### Complete Example: Dialog with SuccessCheck Animation

```tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useSuccessDialog } from "@/hooks/use-success-dialog";

export function CreateHabitForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      setOpen(false);
      setTitle("");
    },
  });

  useEffect(() => {
    if (!open) {
      resetSuccess();
    }
  }, [open, resetSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) throw new Error("Failed to create habit");

      setTitle("");
      triggerSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to create habit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <SuccessCheck size={120} />
            <h3 className="text-2xl font-semibold text-green-500">Habit Created!</h3>
            <p className="text-muted-foreground text-center">
              You're on your way to building better habits!
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Habit title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Habit"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### Complete Example: Toast Notification

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";

export function TaskForm({ onTaskAdded }: { onTaskAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (response.ok) {
        setTitle("");
        showCreationSuccess("task");
        onTaskAdded();
      } else {
        throw new Error("Failed to create task");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      showCreationError("task", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Add a new task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isAdding}
      />
      <Button type="submit" disabled={isAdding || !title.trim()}>
        Add
      </Button>
    </form>
  );
}
```

### Complete Example: Persistent Toast

```tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";

interface JournalEditorProps {
  mode: "create" | "edit";
  existingSlug?: string;
}

export function JournalEditor({ mode, existingSlug }: JournalEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const endpoint = mode === "create"
        ? "/api/journals"
        : `/api/journals/${existingSlug}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save journal");
      }

      // Show persistent toast for create mode only
      if (mode === "create") {
        showCreationSuccess("journal", { persistent: true });
      }

      // Navigate to detail page
      router.push(data.path);
      router.refresh();
    } catch (err) {
      console.error(err);
      showCreationError("journal", err);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Input
        placeholder="Journal title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Write your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={20}
      />
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : mode === "create" ? "Create" : "Update"}
      </Button>
    </form>
  );
}
```

---

## Pattern 4: Task Completion Animation (In-Place Feedback)

**Use for:** Task completion actions that need immediate, delightful feedback without navigation

### Animation Sequence

1. **Green sweep line** - Animates from right to left across task (0.4s)
2. **Fade out** - Task content fades to 50% opacity (0.2s)
3. **Success message** - "Task Completed" appears with checkmark (1s display)
4. **Slide out** - Task slides out and fades from list (0.3s)

**Total duration:** ~2 seconds

### When to Use

- Task completion toggles in lists
- Any action that removes an item from view after success
- Actions that benefit from celebratory feedback

### Implementation

The `TaskCompletionAnimation` component wraps task items and manages the animation sequence automatically.

**Step 1: Import dependencies**

```tsx
import { AnimatePresence } from "framer-motion";
import { TaskCompletionAnimation, useTaskCompletionAnimation } from "@/components/ui/animations/task-completion-animation";
```

**Step 2: Add the hook**

```tsx
const { animatingTasks, startAnimation, cleanupTask, isAnimating } = useTaskCompletionAnimation();
```

**Step 3: Update toggle handler**

```tsx
const handleToggleComplete = async (taskId: number, completed: boolean) => {
  // Start animation before API call
  if (!completed) {
    startAnimation(taskId);
  }

  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });

    if (response.ok) {
      // If marking incomplete, refresh immediately
      if (completed) {
        onTasksChanged();
      }
      // For completion, onTasksChanged called after animation finishes
    }
  } catch (error) {
    console.error("Failed to update task:", error);
    // Cleanup animation on error
    if (!completed) {
      cleanupTask(taskId);
    }
  }
};

const handleAnimationComplete = (taskId: number) => {
  cleanupTask(taskId);
  onTasksChanged(); // Refresh list after animation
};
```

**Step 4: Wrap tasks in animation component**

```tsx
<div className="space-y-2">
  <AnimatePresence mode="popLayout">
    {tasks.map((task) => (
      <TaskCompletionAnimation
        key={task.id}
        isCompleted={task.completed}
        shouldAnimate={isAnimating(task.id)}
        onAnimationComplete={() => handleAnimationComplete(task.id)}
      >
        <div className="flex items-center gap-3 p-3 rounded-lg border">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => handleToggleComplete(task.id, task.completed)}
          />
          <div className="flex-1">
            <p className={task.completed ? "line-through" : ""}>{task.title}</p>
          </div>
        </div>
      </TaskCompletionAnimation>
    ))}
  </AnimatePresence>
</div>
```

### Key Features

**✅ Automatic State Management**
- Hook tracks which tasks are animating
- Prevents duplicate animations
- Cleans up state after completion

**✅ Accessibility Built-In**
- Respects `prefers-reduced-motion` preference
- ARIA live regions for screen readers
- Keyboard navigation maintained

**✅ Error Handling**
- Animation cancels on API failure
- State rolls back gracefully
- User sees error feedback instead

**✅ Smooth List Transitions**
- AnimatePresence handles layout shifts
- Tasks slide out smoothly
- No layout jank

### Complete Example

```tsx
"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/db/tasks";
import { AnimatePresence } from "framer-motion";
import { TaskCompletionAnimation, useTaskCompletionAnimation } from "@/components/ui/animations/task-completion-animation";

interface TaskListProps {
  tasks: Task[];
  onTasksChanged: () => void;
}

export function TaskList({ tasks, onTasksChanged }: TaskListProps) {
  const { animatingTasks, startAnimation, cleanupTask, isAnimating } = useTaskCompletionAnimation();

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    if (!completed) {
      startAnimation(taskId);
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        if (completed) {
          onTasksChanged();
        }
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      if (!completed) {
        cleanupTask(taskId);
      }
    }
  };

  const handleAnimationComplete = (taskId: number) => {
    cleanupTask(taskId);
    onTasksChanged();
  };

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskCompletionAnimation
            key={task.id}
            isCompleted={task.completed}
            shouldAnimate={isAnimating(task.id)}
            onAnimationComplete={() => handleAnimationComplete(task.id)}
          >
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleComplete(task.id, task.completed)}
              />
              <div className="flex-1">
                <p className={task.completed ? "line-through text-muted-foreground" : ""}>
                  {task.title}
                </p>
                {task.priority && (
                  <Badge variant="secondary">{task.priority}</Badge>
                )}
              </div>
            </div>
          </TaskCompletionAnimation>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### Reference Implementations

- `components/widgets/tasks/task-list.tsx` - Main tasks page
- `components/widgets/tasks/recent-tasks.tsx` - Homepage widget
- `components/widgets/daily/daily-tasks.tsx` - Daily view

### Common Pitfalls

**❌ Don't refresh list immediately**
```tsx
// Wrong - list refreshes before animation completes
if (response.ok) {
  onTasksChanged(); // Animation gets cut off!
}
```

**✅ Wait for animation callback**
```tsx
// Correct - list refreshes after animation
if (response.ok) {
  if (completed) {
    onTasksChanged(); // Only for unchecking
  }
  // For completion, onTasksChanged called in handleAnimationComplete
}
```

**❌ Don't forget error cleanup**
```tsx
// Wrong - animation state persists on error
catch (error) {
  console.error(error); // Task appears stuck animating
}
```

**✅ Clean up on error**
```tsx
// Correct - animation state cleaned up
catch (error) {
  console.error(error);
  if (!completed) {
    cleanupTask(taskId); // Reset animation state
  }
}
```

---

## Summary

Following this guide ensures:
- ✅ Consistent user experience across all creation actions
- ✅ Appropriate feedback for different action types
- ✅ Delightful animations for important moments
- ✅ Clear error communication
- ✅ Maintainable, reusable code patterns
- ✅ Engaging task completion feedback

When in doubt, reference existing implementations or ask for clarification!

---

**Last Updated:** 2025-11-20
**Version:** 1.0
**Maintained by:** Development Team
