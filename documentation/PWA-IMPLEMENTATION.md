# PWA Implementation Plan: Homepage Dashboard

## Overview
Transform the Next.js 16 Homepage application into a fully installable Progressive Web App with offline CRUD capabilities, custom install prompts, and optimized caching strategies.

**Current State**: No PWA capabilities (no manifest, service worker, icons, or meta tags)
**Target State**: Full-featured installable PWA with offline support for viewing AND editing
**Deployment**: Firebase App Hosting (https://homepage.sutorus.com)
**Framework**: Next.js 16.0.7 with App Router, React 19, TypeScript

## Implementation Approach
**Phased rollout** with 3 phases:
- **Phase 1**: Foundation (installability + offline viewing)
- **Phase 2**: Enhanced offline (CRUD operations + sync queue)
- **Phase 3**: Polish (install prompts + push notifications)

---

## Phase 1: Foundation - Basic PWA (Installability + Offline Viewing)

### Goals
- Make app installable on desktop and mobile
- Enable offline viewing of previously loaded pages
- Implement intelligent caching strategies
- Achieve Lighthouse PWA score 100/100

### Step 1.1: Install Dependencies
```bash
npm install @ducanh2912/next-pwa
npm install --save-dev webpack
```

**Why `@ducanh2912/next-pwa`**: Modern fork compatible with Next.js 16 App Router (original next-pwa is deprecated)

### Step 1.2: Configure PWA in next.config.ts

**File**: `next.config.ts`

**Changes**:
1. Import `withPWA` wrapper from @ducanh2912/next-pwa
2. Wrap existing config with PWA configuration
3. Configure service worker destination, caching strategies, and build exclusions

**Key Configuration**:
- `dest: "public"` - Generate service worker in public directory
- `disable: process.env.NODE_ENV === "development"` - Only enable in production
- `register: true` - Auto-register service worker
- `skipWaiting: true` - Apply updates immediately
- Custom runtime caching for:
  - Static assets (cache-first, 30 days)
  - API routes (network-first with 5min fallback)
  - External images (stale-while-revalidate, 7 days)
  - Auth routes (network-only, never cache)

### Step 1.3: Create Web App Manifest

**File**: `public/manifest.json` (NEW)

**Content**:
- name: "Homepage - Personal Dashboard"
- short_name: "Homepage"
- start_url: "/home"
- display: "standalone"
- theme_color: "#0a0a0a" (dark mode)
- background_color: "#0a0a0a"
- icons: 192x192, 512x512 (standard + maskable)
- shortcuts: Quick actions for "Add Task" and "Log Mood"
- categories: ["productivity", "lifestyle", "health"]

**Theme Support**: Use dark theme color (#0a0a0a) to match app's dark mode default

### Step 1.4: Generate PWA Icons

**Files to Create** (all in `public/`):
- `favicon.ico` - Multi-resolution (16x16, 32x32)
- `icon-192.png` - Android minimum size
- `icon-512.png` - Android splash screen
- `icon-maskable-192.png` - Android adaptive icon (with safe zone)
- `icon-maskable-512.png` - Android adaptive icon large
- `apple-touch-icon.png` - iOS home screen (180x180)

**Design Approach**:
- Simple "H" lettermark
- Brand color background: `oklch(0.65 0.18 41)` ≈ #E67E22
- White/light foreground text
- 20% padding for maskable safe zone

**Generation Method**: Use ImageMagick or online tool (RealFaviconGenerator.net) to create all sizes from a 512x512 source

### Step 1.5: Update Root Layout Metadata

**File**: `app/layout.tsx`

**Changes to `metadata` export**:
1. Add `manifest: "/manifest.json"`
2. Add `appleWebApp` configuration
3. Add `icons` array with all icon references
4. Add `viewport` configuration
5. Add `themeColor` for dark/light modes
6. Enhance `openGraph` and `twitter` metadata
7. Add `formatDetection` to disable phone number detection

**Additional `<head>` tags** (add in layout component):
- `<meta name="application-name" content="Homepage" />`
- `<meta name="apple-mobile-web-app-capable" content="yes" />`
- `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`
- `<meta name="mobile-web-app-capable" content="yes" />`

### Step 1.6: Create Offline Fallback Page

**File**: `app/offline/page.tsx` (NEW)

**Content**:
- Friendly "You're offline" message with WifiOff icon
- List of available cached pages (Home, Tasks, Calendar, Habits, etc.)
- "Retry" button to check connection
- Link back to cached home page
- Match app theme and styling

**Design**: Use existing UI components (Card, Button) and lucide-react icons for consistency

### Step 1.7: Update .gitignore

**File**: `.gitignore`

**Add**:
```
# PWA - Generated service worker files
public/sw.js
public/sw.js.map
public/workbox-*.js
public/workbox-*.js.map
public/worker-*.js
public/worker-*.js.map
public/fallback-*.js
```

**Why**: Service worker files are auto-generated during build and should not be committed

### Step 1.8: Test Phase 1

**Local Testing**:
1. Build production: `npm run build`
2. Start production server: `npm start`
3. Open Chrome DevTools > Application tab
4. Verify service worker registered
5. Check manifest loads correctly
6. Test offline mode (Network tab > Offline)
7. Verify cached pages load offline

**Lighthouse Audit**:
```bash
npx lighthouse http://localhost:3000 --output html --output-path ./pwa-audit.html --only-categories=pwa
```

**Target**: Lighthouse PWA score 100/100

---

## Phase 2: Enhanced Offline - CRUD Operations + Sync Queue

### Goals
- Enable offline creation/editing (tasks, habits, moods, journal entries)
- Implement Background Sync API for queued mutations
- Add visual indicators for sync status
- Handle conflict resolution for offline edits

### Step 2.1: Create Offline Queue System

**File**: `lib/pwa/offline-queue.ts` (NEW)

**Features**:
- IndexedDB storage for pending mutations
- Queue operations: add, remove, retry, clear
- Mutation types: CREATE_TASK, UPDATE_HABIT, LOG_MOOD, etc.
- Timestamp and retry count tracking
- Export/import for debugging

**Schema**:
```typescript
interface QueuedMutation {
  id: string;
  type: MutationType;
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}
```

### Step 2.2: Implement Background Sync

**File**: `lib/pwa/background-sync.ts` (NEW)

**Features**:
- Register sync event when offline mutations occur
- Process queue when connection restored
- Retry failed syncs with exponential backoff
- Handle sync failures gracefully
- Fire success/error events for UI updates

**Integration**: Hook into service worker's `sync` event

### Step 2.3: Create Network Status Hook

**File**: `hooks/useNetworkStatus.ts` (NEW)

**Hook Features**:
- Track online/offline status via `navigator.onLine`
- Listen for `online` and `offline` events
- Trigger sync queue processing when online
- Return current status and event handlers

**Usage**: Add to Providers component for global network awareness

### Step 2.4: Add Sync Status Indicator

**File**: `components/pwa/sync-status.tsx` (NEW)

**Component Features**:
- Badge showing "X items pending sync"
- Appears when offline mutations queued
- Shows sync progress when syncing
- Success/error notifications
- Manual "Retry Sync" button

**Placement**: Add to Header component (top-right corner)

### Step 2.5: Modify Form Components for Offline Support

**Files to Modify**:
- `components/tasks/create-task-dialog.tsx`
- `components/habits/habit-tracker.tsx`
- `components/mood/mood-logger.tsx`
- `app/(dashboard)/journal/create/page.tsx`

**Changes for Each**:
1. Check network status before submission
2. If offline: Add to queue, show optimistic UI, display success toast
3. If online: Normal API call
4. On queue sync success: Update UI, remove from queue
5. On queue sync failure: Show error, allow retry

**Pattern**:
```typescript
const { isOnline } = useNetworkStatus();

const handleSubmit = async (data) => {
  if (!isOnline) {
    await offlineQueue.add('CREATE_TASK', data);
    toast.success('Task saved - will sync when online');
    // Optimistic UI update
    return;
  }
  // Normal API call
};
```

### Step 2.6: Optimistic UI Updates

**File**: `lib/pwa/optimistic-updates.ts` (NEW)

**Features**:
- Generate temporary IDs for offline-created items
- Update local state immediately
- Replace temp IDs with server IDs after sync
- Rollback on sync failure

**Integration**: Use with React Query or local state management

### Step 2.7: Conflict Resolution

**File**: `lib/pwa/conflict-resolver.ts` (NEW)

**Strategy**:
- **Simple conflicts** (create operations): Always apply (no conflict)
- **Update conflicts** (editing same item): Last-write-wins
- **Delete conflicts**: Show warning if item was edited offline but deleted on server
- **Future enhancement**: Allow user to choose resolution strategy

### Step 2.8: Test Phase 2

**Testing Scenarios**:
1. Go offline, create task → verify queued
2. Come back online → verify sync occurs automatically
3. Go offline, edit habit → verify optimistic update
4. Sync failure (API error) → verify retry logic
5. Multiple offline mutations → verify batch sync
6. Clear queue → verify all items removed

---

## Phase 3: Polish - Install Prompts + Push Notifications

### Goals
- Custom install prompt UI
- Settings page install option
- PWA status indicators
- Push notifications for habit reminders

### Step 3.1: Create Install Prompt Hook

**File**: `hooks/useInstallPrompt.ts` (NEW)

**Hook Features**:
- Listen for `beforeinstallprompt` event
- Store prompt for later use
- Track installation status
- Check if running in standalone mode
- Return install handler and status

**Logic**:
- Show after 2 page views (not immediately)
- Check localStorage for dismissal preference
- Respect "Don't show again" choice

### Step 3.2: Create Install Prompt Component

**File**: `components/pwa/install-prompt.tsx` (NEW)

**Component**:
- Dismissible banner (using sonner toast)
- "Install Homepage" call-to-action
- "Don't show again" option
- Platform-specific messaging (Desktop vs Mobile)
- Appears at bottom of screen (non-intrusive)

**Trigger Logic**:
- Only show if `beforeinstallprompt` event fired
- Only show if not previously dismissed
- Only show after 2+ page views
- Hide if already installed

### Step 3.3: Add Install Option to Settings

**File**: `app/(dashboard)/settings/page.tsx`

**Changes**:
- Add "Install App" card in Settings
- Show current install status ("Installed" vs "Not Installed")
- Manual install button (triggers prompt)
- Platform-specific instructions:
  - **Desktop Chrome/Edge**: Click install button
  - **iOS Safari**: Tap Share → Add to Home Screen
  - **Android Chrome**: Tap install banner or menu → Install app
- Link to offline features documentation

### Step 3.4: Add PWA Status Badge

**File**: `components/pwa/pwa-status.tsx` (NEW)

**Component**:
- Small badge showing "Running as app" when in standalone mode
- Display mode indicator (standalone, browser, etc.)
- Update available notification
- "Reload to update" button when new service worker detected

**Placement**: Footer or Settings page

### Step 3.5: Service Worker Update Prompt

**File**: `components/pwa/update-prompt.tsx` (NEW)

**Component**:
- Detects new service worker waiting
- Shows toast notification: "Update available"
- "Reload" button to activate new service worker
- Auto-dismiss after 30 seconds
- Can manually trigger via Settings

**Integration**: Listen for `controllerchange` event in service worker

### Step 3.6: Push Notifications Setup (Optional)

**File**: `lib/pwa/push-notifications.ts` (NEW)

**Features**:
- Request notification permission
- Subscribe to push notifications
- Handle push events in service worker
- Notification types:
  - Daily habit reminder (9am local time)
  - Task due date notifications
  - Achievement unlocks
  - Weekly summary prompts

**Backend Required**:
- Firebase Cloud Messaging (FCM) integration
- Store push subscriptions in database
- Cron jobs for scheduled notifications

**Settings UI**:
- Toggle for notification types
- Time preference for daily reminders
- Unsubscribe option

### Step 3.7: Test Phase 3

**Install Flow Testing**:
- Desktop Chrome: Verify install banner appears
- Desktop Edge: Verify install works
- iOS Safari: Verify Add to Home Screen works
- Android Chrome: Verify install prompt works
- After install: Verify splash screen, icons, theme color

**Update Testing**:
- Deploy new version
- Verify update prompt appears
- Click "Reload" → verify new version loads
- Check no data loss during update

**Push Notifications** (if implemented):
- Request permission → verify prompt
- Send test notification → verify appears
- Click notification → verify opens app
- Unsubscribe → verify notifications stop

---

## Critical Files Summary

### Files to Create (18 new files)
1. `public/manifest.json` - Web app manifest
2. `public/icon-192.png` - App icon
3. `public/icon-512.png` - App icon
4. `public/icon-maskable-192.png` - Maskable icon
5. `public/icon-maskable-512.png` - Maskable icon
6. `public/apple-touch-icon.png` - iOS icon
7. `public/favicon.ico` - Favicon
8. `app/offline/page.tsx` - Offline fallback page
9. `lib/pwa/offline-queue.ts` - Offline mutation queue
10. `lib/pwa/background-sync.ts` - Background sync logic
11. `lib/pwa/optimistic-updates.ts` - Optimistic UI helpers
12. `lib/pwa/conflict-resolver.ts` - Conflict resolution
13. `lib/pwa/push-notifications.ts` - Push notification setup
14. `hooks/useNetworkStatus.ts` - Network status hook
15. `hooks/useInstallPrompt.ts` - Install prompt hook
16. `components/pwa/sync-status.tsx` - Sync status indicator
17. `components/pwa/install-prompt.tsx` - Custom install banner
18. `components/pwa/pwa-status.tsx` - PWA status badge
19. `components/pwa/update-prompt.tsx` - Service worker update UI

### Files to Modify (6 existing files)
1. `next.config.ts` - Add PWA plugin wrapper
2. `app/layout.tsx` - Add PWA metadata and meta tags
3. `.gitignore` - Exclude generated service worker files
4. `app/(dashboard)/settings/page.tsx` - Add install option
5. `components/tasks/create-task-dialog.tsx` - Add offline support
6. `components/habits/habit-tracker.tsx` - Add offline support
7. `components/mood/mood-logger.tsx` - Add offline support
8. `app/(dashboard)/journal/create/page.tsx` - Add offline support

---

## Caching Strategies

### Static Assets (Cache First, 30 days)
- Google Fonts
- Next.js bundles (JS, CSS)
- Images from public directory
- UI icons

### API Routes (Network First, 5min fallback)
- `/api/calendar/*` - Calendar events
- `/api/activities/*` - Exercise activities
- `/api/habits/*` - Habit tracking
- `/api/tasks/*` - Task management
- `/api/mood/*` - Mood journal
- `/api/media/*` - Media library
- `/api/journal/*` - Journal entries

### External Images (Stale While Revalidate, 7 days)
- Steam avatars (avatars.steamstatic.com)
- Amazon media (m.media-amazon.com)
- IGDB images (images.igdb.com)
- Book covers (external APIs)

### Auth Routes (Network Only, never cache)
- `/api/auth/*` - Authentication endpoints
- Always require fresh data, fail gracefully if offline

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Lighthouse PWA score: 100/100
- [ ] App installs successfully on desktop (Chrome/Edge)
- [ ] App installs successfully on mobile (iOS Safari, Android Chrome)
- [ ] Offline mode works (cached pages load)
- [ ] Icons display correctly after install
- [ ] Service worker registered without errors
- [ ] Manifest accessible at /manifest.json

### Phase 2 Complete When:
- [ ] Create task offline → syncs when online
- [ ] Mark habit complete offline → syncs when online
- [ ] Log mood offline → syncs when online
- [ ] Sync status indicator shows pending items
- [ ] Manual retry works after sync failure
- [ ] Optimistic UI updates immediately
- [ ] No data loss during offline/online transitions

### Phase 3 Complete When:
- [ ] Install prompt appears after 2 page views
- [ ] Settings page shows install status
- [ ] "Don't show again" persists preference
- [ ] Update prompt appears when new version deployed
- [ ] Reload applies new service worker
- [ ] Push notifications work (if implemented)
- [ ] Standalone mode badge displays correctly

---

## Deployment Considerations

### Firebase App Hosting Compatibility
- Service worker serves correctly from `/public`
- Manifest accessible at root path
- No CORS issues with external assets
- Headers allow service worker registration
- Build memory (2Gi) sufficient for PWA asset generation

### Build Process
- `@ducanh2912/next-pwa` runs during `next build`
- Generates service worker in `public/` directory
- No additional build scripts needed
- Build time increase: ~10-20 seconds

### Environment Variables
No new environment variables required for basic PWA. Optional for Phase 3:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - For push notifications
- `VAPID_PRIVATE_KEY` - Server-side push notifications

---

## Timeline Estimate

- **Phase 1** (Foundation): 2-3 days
  - Day 1: Dependencies, config, manifest, icons
  - Day 2: Metadata, offline page, testing
  - Day 3: Cross-platform testing, fixes

- **Phase 2** (Offline CRUD): 3-4 days
  - Day 1: Offline queue, background sync
  - Day 2: Network status, sync UI
  - Day 3-4: Modify form components, optimistic updates

- **Phase 3** (Polish): 2-3 days
  - Day 1: Install prompts, Settings integration
  - Day 2: Update prompts, PWA status
  - Day 3: Push notifications (optional)

**Total**: 7-10 days for complete implementation

---

## Next Steps

1. **Icon Design**: Create 512x512 base icon with "H" lettermark
2. **Phase 1 Implementation**: Start with dependencies and configuration
3. **Local Testing**: Test PWA features in production build
4. **Deploy to Staging**: Test on Firebase before production
5. **Production Deploy**: Roll out to https://homepage.sutorus.com
6. **Monitor Metrics**: Track installation rate, offline usage
7. **Iterate**: Gather feedback, refine based on user behavior
