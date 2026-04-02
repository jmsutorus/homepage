# New Feature Checklist

When adding a new feature or page to this application, use this checklist to ensure architectural consistency and an optimized user experience across both desktop and mobile devices.

## 1. Page Structure and Routing
- [ ] **`page.tsx`:** Create this for server-side data fetching.
- [ ] **Dynamic Configuration:** Ensure `page.tsx` exports appropriate dynamic configs (e.g., `export const dynamic = "force-dynamic";`) if the data frequently updates.
- [ ] **`page-client.tsx`:** Create this to handle all client-side interactivity, state management, and UI rendering. The server component should pass fetched data as props to this client component.
- [ ] **`loading.tsx`:** Create a loading skeleton using `@/components/ui/skeleton` that matches the exact layout of the page to prevent layout shifts during initial load.

## 2. Responsive UI Architecture (`page-client.tsx`)
- [ ] **Navigation & View Management:** Use `Tabs` alongside `PageTabsList` (`@/components/ui/page-tabs-list`) if the feature requires multiple sub-views (e.g., a List view and an Analytics view).
- [ ] **Desktop vs. Mobile Action Flows:** Implement separate form/action experiences tailored to the user's device:
  - [ ] **Desktop:** Embed inline forms or use standard dialogs for creation/editing (e.g., `Create[Feature]Form` in the header).
  - [ ] **Mobile:** Use bottom sheets (e.g., `Mobile[Feature]Sheet`) triggered by floating action buttons or the action button inside `PageTabsList` to ensure touch-friendly interactions.
- [ ] **Container Styling:** Ensure standard container constraints and responsive padding are applied (e.g., `className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl"`).

## 3. Dedicated Components Location
- [ ] **Component Grouping:** Stash feature-specific components together inside `@/components/widgets/[feature-name]/`.
- [ ] **Standard Components to Consider:**
  - [ ] Primary List/Data display component (e.g., `[Feature]List`).
  - [ ] Form for creation and edits (e.g., `Create[Feature]Form`).
  - [ ] Mobile sheet wrapper (e.g., `Mobile[Feature]Sheet`).
  - [ ] Data visualization/chart components if applicable.

## 4. Logic, Data & Actions
- [ ] **Server Actions:** Keep database logic modular by defining reusable server actions inside `@/lib/actions/[feature-name].ts`.
- [ ] **Concurrent Fetching:** Use `Promise.all` in `page.tsx` to handle multiple independent server action queries optimally.
- [ ] **Type Definitions:** Explicitly define and export TypeScript interfaces for the returned data items to pass along safely to the client components.
