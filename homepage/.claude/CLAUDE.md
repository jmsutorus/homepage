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

# Context
Context and developer doumentation can be found in /documentation
