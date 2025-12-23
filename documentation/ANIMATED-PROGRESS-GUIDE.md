# Animated Progress Components Guide

This guide covers the animated progress components available for displaying progress indicators with smooth animations.

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Usage Examples](#usage-examples)
4. [Props Reference](#props-reference)
5. [Best Practices](#best-practices)

---

## Overview

Animated progress components provide satisfying visual feedback by animating from 0 to the target value when they come into view. They use an easeOutExpo easing curve for smooth deceleration.

**Key Features:**
- **Scroll-triggered animation** - Animates when the element enters the viewport
- **One-time animation** - Only animates once per page load
- **Customizable** - Multiple sizes, colors, and display options
- **Accessible** - Respects user preferences for reduced motion

---

## Components

### 1. AnimatedProgress (Linear Bar)

A horizontal progress bar that fills from left to right.

**Location:** `components/ui/animations/animated-progress.tsx`

```tsx
import { AnimatedProgress } from "@/components/ui/animations/animated-progress";

// Basic usage
<AnimatedProgress value={75} max={100} />

// With all options
<AnimatedProgress
  value={15}
  max={30}
  size="md"
  color="success"
  showLabel={true}
  labelPosition="outside"
  animate={true}
  delay={0.2}
/>
```

### 2. AnimatedProgressRing (Circular)

A circular progress indicator similar to Apple Watch activity rings.

**Location:** `components/ui/animations/animated-progress.tsx`

```tsx
import { AnimatedProgressRing } from "@/components/ui/animations/animated-progress";

// Basic usage
<AnimatedProgressRing value={75} max={100} />

// With all options
<AnimatedProgressRing
  value={75}
  max={100}
  size={80}
  strokeWidth={8}
  color="success"
  showLabel={true}
  animate={true}
  delay={0}
/>
```

---

## Usage Examples

### Habit Progress Toward Target

```tsx
<AnimatedProgress
  value={habit.stats.totalCompletions}
  max={habit.target}
  size="md"
  color={
    habit.completed
      ? "success"
      : habit.stats.totalCompletions >= habit.target
        ? "warning"
        : "primary"
  }
/>
```

### Daily Completion Summary

```tsx
<AnimatedProgress
  value={completedCount}
  max={totalCount}
  size="sm"
  color={completedCount === totalCount ? "success" : "primary"}
/>
```

### Goal Progress Ring

```tsx
<AnimatedProgressRing
  value={currentValue}
  max={goalValue}
  size={100}
  strokeWidth={10}
  color="primary"
  showLabel={true}
/>
```

### Multiple Staggered Progress Bars

```tsx
{items.map((item, index) => (
  <AnimatedProgress
    key={item.id}
    value={item.progress}
    max={item.target}
    delay={index * 0.1} // Stagger by 100ms each
  />
))}
```

---

## Props Reference

### AnimatedProgress Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | *required* | Current progress value |
| `max` | `number` | `100` | Maximum value (100%) |
| `className` | `string` | - | Additional CSS classes for wrapper |
| `barClassName` | `string` | - | Additional CSS classes for the progress bar |
| `showLabel` | `boolean` | `false` | Whether to show percentage label |
| `labelPosition` | `"inside" \| "outside" \| "tooltip"` | `"outside"` | Where to display the label |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Height of the progress bar |
| `color` | `"default" \| "success" \| "warning" \| "danger" \| "primary"` | `"default"` | Color theme |
| `animate` | `boolean` | `true` | Whether to animate on scroll into view |
| `delay` | `number` | `0` | Animation delay in seconds |

**Size Reference:**
- `sm` - 6px height (subtle, inline indicators)
- `md` - 10px height (standard progress bars)
- `lg` - 16px height (prominent progress displays, supports inside labels)

### AnimatedProgressRing Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | *required* | Current progress value |
| `max` | `number` | `100` | Maximum value (100%) |
| `size` | `number` | `80` | Diameter in pixels |
| `strokeWidth` | `number` | `8` | Thickness of the ring |
| `className` | `string` | - | Additional CSS classes |
| `color` | `"default" \| "success" \| "warning" \| "danger" \| "primary"` | `"default"` | Color theme |
| `showLabel` | `boolean` | `true` | Whether to show percentage in center |
| `animate` | `boolean` | `true` | Whether to animate on scroll into view |
| `delay` | `number` | `0` | Animation delay in seconds |

---

## Best Practices

### When to Use Each Component

| Use Case | Component | Reasoning |
|----------|-----------|-----------|
| Habit/task progress | `AnimatedProgress` | Horizontal bars work well in lists |
| Goal completion | `AnimatedProgressRing` | Circular format draws attention |
| Summary statistics | `AnimatedProgress` | Clean, scannable format |
| Dashboard widgets | `AnimatedProgressRing` | Visual impact, compact |
| Form completion | `AnimatedProgress` | Familiar web pattern |

### Color Guidelines

| Color | Use For |
|-------|---------|
| `primary` | Default progress, neutral state |
| `success` | Completed goals, 100% achievement |
| `warning` | Approaching limit, needs attention |
| `danger` | Overdue, exceeded limit, errors |
| `default` | Matches theme primary color |

### Animation Tips

1. **Stagger multiple bars** - Use the `delay` prop to create a cascade effect
2. **Disable for lists** - Consider `animate={false}` for very long lists
3. **Match duration to context** - Default 0.8s works for most cases
4. **Test scroll behavior** - Ensure animations trigger at appropriate scroll positions

### Accessibility Considerations

- Progress bars use semantic markup
- Labels provide text alternatives for screen readers
- Animations respect `prefers-reduced-motion` (via Framer Motion)
- Color is not the only indicator (always show numeric values)

---

## Current Usage in Codebase

| Location | Component | Purpose |
|----------|-----------|---------|
| `habits-list.tsx` | `AnimatedProgress` | Shows habit completion toward target |
| `daily-habits.tsx` | `AnimatedProgress` | Shows daily habit completion summary |
| `people/page-client.tsx` | `AnimatedProgressRing` | Birthday countdown widgets for next 3 upcoming birthdays |

---

## Future Enhancement Ideas

- Add `AnimatedProgressRing` to Year in Review stats
- Add task completion progress to daily view
- Add reading/media consumption progress bars
- Add exercise goal progress rings
