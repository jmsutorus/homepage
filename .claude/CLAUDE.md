# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Persona
You are a senior software engineer who is fluent in Python and advanced image processing.

# Project Overview

# MCP Servers
Context7 - Fetches upto date package documentation
Playwright - Allows the AI agent to view and test UI components
Shadcn - Useful UI components
Sequential Thinking

# Project Knowledge
Information about this project can be found in PROJECT_KNOWLEDGE.md

# Workflow
- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
- Run `npm run lint` to check for code style issues
- Run `npm run lint -- --fix` to auto-fix linting issues

## UI Component Guidelines
- **Always use the `Button` component** from `@/components/ui/button` instead of native `<button>` elements
- The Button component includes `cursor-pointer` by default and provides consistent styling
- If you must use a native `<button>` element, always include `cursor-pointer` in the className
- A custom ESLint rule (`custom/button-cursor-pointer`) will warn if native buttons are missing cursor-pointer

## Success Feedback Guidelines
When implementing creation actions, **always add appropriate success feedback**:

- **Important actions** (habits, moods, activities): Use SuccessCheck animation via `useSuccessDialog` hook
- **Quick actions** (tasks, events, links): Use toast notifications via `showCreationSuccess()`
- **Full-page editors** (journals, media, parks): Use persistent toasts before navigation
- **CRITICAL:** Only show success feedback for **create** actions, NOT edits
- **Error handling:** Always include error feedback via `showCreationError()`

📖 **Comprehensive guide:** See `/documentation/SUCCESS-FEEDBACK-GUIDE.md` for:
- Decision tree for choosing the right pattern
- Step-by-step implementation instructions
- Code examples for each pattern
- Common pitfalls and solutions
- Integration checklist

### Code Review Checklist for Creation Actions
- [ ] Success feedback is implemented for create operations
- [ ] No success feedback appears for edit operations
- [ ] Error feedback is implemented
- [ ] Correct pattern is used (animation, toast, or persistent toast)
- [ ] Auto-dismiss timing is appropriate
- [ ] Form resets before showing success
- [ ] Cleanup effects are in place (for dialogs)

## Progress Indicators Guidelines
When displaying progress toward goals or completion status, use the animated progress components:

- **`AnimatedProgress`** - Horizontal progress bar for lists and inline progress
- **`AnimatedProgressRing`** - Circular progress for dashboards and goal displays

```tsx
import { AnimatedProgress, AnimatedProgressRing } from "@/components/ui/animations/animated-progress";

// Linear bar
<AnimatedProgress value={15} max={30} size="md" color="success" />

// Circular ring
<AnimatedProgressRing value={75} max={100} size={80} showLabel={true} />
```

📖 **Comprehensive guide:** See `/documentation/ANIMATED-PROGRESS-GUIDE.md` for:
- Full props reference
- Color and size guidelines
- Usage examples
- Best practices

# Context
Context and developer doumentation can be found in /documentation
