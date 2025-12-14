# PWA Service Worker Update Prompts

## Overview

Service worker update prompts notify users when a new version of your PWA is available and provide a seamless way to update. This implementation includes:

1. **Automatic update detection** - Monitors for new service worker versions
2. **Smart update prompts** - Toast notifications when updates are available
3. **Manual update checks** - Settings page integration
4. **Periodic checks** - Automatic checks every 60 seconds
5. **Focus-based checks** - Checks when page gains focus

---

## How It Works

### Update Detection Flow

1. **New Version Deployed**: You deploy a new version to production
2. **Service Worker Updated**: Browser downloads new service worker
3. **Waiting State**: New service worker enters "waiting" state
4. **User Notification**: Toast appears: "Update Available"
5. **User Action**: User clicks "Reload Now"
6. **Skip Waiting**: Message sent to waiting service worker
7. **Activation**: New service worker activates
8. **Page Reload**: Page automatically reloads with new version

### Automatic Update Checks

Updates are checked:
- **On page load** - Initial check when app opens
- **Every 60 seconds** - Periodic background checks
- **On focus** - When user returns to tab/window
- **Manual** - Via "Check for Updates" button in Settings

---

## Components

### 1. `useServiceWorkerUpdate` Hook

**Location**: `hooks/useServiceWorkerUpdate.ts`

**Purpose**: Manages service worker update state and handles update events.

**Returns**:
- `isUpdateAvailable` - Boolean indicating if update is waiting
- `isUpdating` - Boolean indicating update is in progress
- `updateServiceWorker()` - Function to apply the update
- `checkForUpdate()` - Function to manually check for updates

**Usage**:
```tsx
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

function MyComponent() {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorkerUpdate();

  if (isUpdateAvailable) {
    return (
      <button onClick={updateServiceWorker}>
        Update Available - Click to Reload
      </button>
    );
  }

  return null;
}
```

**Features**:
- Listens for `updatefound` event on service worker registration
- Detects when new service worker is installed and waiting
- Sends `SKIP_WAITING` message to waiting service worker
- Listens for `controllerchange` event (triggers reload)
- Automatic periodic update checks (60s interval)
- Checks for updates when page gains focus

---

### 2. `UpdatePrompt` Component

**Location**: `components/pwa/update-prompt.tsx`

**Purpose**: Automatically shows update toast when new version is available.

**Features**:
- Shows toast notification automatically
- Never auto-dismisses (user must take action)
- Two action buttons:
  - **Reload Now** - Applies update immediately
  - **Later** - Dismisses temporarily (will show again on refresh)
- Positioned at top-center for visibility
- Shows loading state during update
- Prevents duplicate toasts with unique ID

**Integration**:
Added to `components/providers.tsx` - runs globally throughout the app.

---

### 3. Settings Page Integration

**Location**: `components/widgets/settings/pwa-install-card.tsx`

**Purpose**: Manual update check and status display.

**Features**:

**When Update Available**:
- Shows blue highlighted box
- "Update Available" heading
- "A new version is ready to install" message
- "Update Now" button to apply update

**When Up to Date**:
- Shows "You're running the latest version" message
- "Updates are checked automatically" subtitle
- "Check for Updates" button for manual check
- Button shows spinner while checking

**Only Visible When Installed**:
- Section only appears if app is installed
- Hidden for regular browser users

---

## User Experience

### Automatic Update (Typical User)

1. User is using the installed app
2. New version is deployed to server
3. Service worker detects new version (within 60s or on focus)
4. Toast appears at top: "Update Available"
5. User clicks "Reload Now"
6. Page reloads with new version
7. User continues seamlessly

### Manual Update Check (Power User)

1. User goes to Settings page
2. Scrolls to "Install App" card
3. Sees "App Updates" section
4. Clicks "Check for Updates"
5. Button shows "Checking..." with spinner
6. If update available: "Update Now" button appears
7. If up to date: Toast confirms "You're running the latest version!"

### Update During Use (Edge Case)

1. User is actively using the app
2. Update detected in background
3. Toast appears but doesn't interrupt workflow
4. User can click "Later" to continue
5. Update will be available on next page load/refresh

---

## Technical Details

### Service Worker Lifecycle

```
Old SW (Active) → New SW (Installing) → New SW (Installed/Waiting) → New SW (Activating) → New SW (Active)
```

**Key States**:
1. **Installing**: New SW is downloading assets
2. **Installed/Waiting**: New SW is ready but waiting for old SW to close
3. **Activating**: New SW is taking control
4. **Activated**: New SW is now serving the page

### Skip Waiting Message

When user clicks "Reload Now", this message is sent:

```javascript
waitingWorker.postMessage({ type: "SKIP_WAITING" });
```

The service worker must handle this message:

```javascript
// In service worker (handled by next-pwa automatically)
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

**Note**: `@ducanh2912/next-pwa` handles this automatically via workbox.

### Controller Change Event

When new service worker activates, `controllerchange` fires:

```javascript
navigator.serviceWorker.addEventListener('controllerchange', () => {
  window.location.reload(); // Reload page with new version
});
```

This ensures the user gets the new version immediately.

---

## Configuration

### Change Update Check Interval

In `hooks/useServiceWorkerUpdate.ts`:

```typescript
// Check every 60 seconds (default)
const updateInterval = setInterval(checkForUpdates, 60000);

// Change to 5 minutes:
const updateInterval = setInterval(checkForUpdates, 300000);

// Change to 30 seconds (more aggressive):
const updateInterval = setInterval(checkForUpdates, 30000);
```

### Disable Focus-Based Checks

In `hooks/useServiceWorkerUpdate.ts`:

```typescript
// Comment out these lines:
// window.addEventListener("focus", handleFocus);
// window.removeEventListener("focus", handleFocus);
```

### Customize Toast Duration

In `components/pwa/update-prompt.tsx`:

```typescript
toast.custom(
  (t) => (/* ... */),
  {
    duration: Infinity, // Never auto-dismiss (recommended)
    // Or set to auto-dismiss after time:
    // duration: 30000, // 30 seconds
    position: "top-center",
  }
);
```

---

## Testing

### Test Update Detection Locally

**Method 1: Code Change**

1. Build initial version:
   ```bash
   npx next build --webpack
   npm start
   ```

2. Open http://localhost:3000
3. Install the app if prompted
4. Keep the app open

5. In another terminal, make a small code change:
   ```bash
   # Edit any file, e.g., add a comment
   echo "// Test change" >> app/layout.tsx
   ```

6. Rebuild:
   ```bash
   npx next build --webpack
   ```

7. Wait up to 60 seconds or switch tabs and back
8. Toast should appear: "Update Available"

**Method 2: Manual Service Worker Registration**

1. Open DevTools > Application > Service Workers
2. Check "Update on reload"
3. Refresh the page
4. New service worker will install
5. Toast should appear

**Method 3: Simulate in DevTools**

1. Open DevTools > Application > Service Workers
2. Click "skipWaiting" on the waiting service worker
3. This simulates the update flow

### Test Manual Update Check

1. Build and start: `npx next build --webpack && npm start`
2. Install the app
3. Go to Settings page
4. Find "Install App" card > "App Updates" section
5. Click "Check for Updates"
6. Should show "Checking..." then "You're running the latest version!"

### Test Update Flow End-to-End

1. Deploy version 1.0 to production
2. Users install and use the app
3. Deploy version 1.1 to production
4. Within 60 seconds, users see "Update Available" toast
5. User clicks "Reload Now"
6. Page reloads
7. User now has version 1.1

---

## Troubleshooting

### Update Toast Never Appears

**Possible Causes**:
1. Service worker not registered
2. No actual update deployed
3. Browser cache issue
4. Development mode (SW disabled)

**Solutions**:
- Check DevTools > Application > Service Workers
- Verify new version deployed
- Hard refresh (Ctrl+Shift+R)
- Test in production build only

### "Check for Updates" Does Nothing

**Possible Causes**:
1. Service worker not registered
2. Already on latest version
3. Network error

**Solutions**:
- Check console for errors
- Verify service worker in DevTools
- Check network tab for failed requests

### Page Doesn't Reload After Update

**Possible Causes**:
1. `controllerchange` event not firing
2. Service worker not activating
3. Browser blocking reload

**Solutions**:
- Check console for errors
- Manually refresh the page
- Check service worker state in DevTools

### Multiple Update Toasts

**Possible Causes**:
1. Multiple components using the hook
2. Toast ID not preventing duplicates

**Solutions**:
- Ensure UpdatePrompt only used once (in Providers)
- Verify toast has `id: "sw-update"` option

---

## Best Practices

### 1. Don't Force Updates Immediately

Let users choose when to update. Don't auto-reload without permission.

✅ **Good**: Show toast, let user click "Reload Now"
❌ **Bad**: Auto-reload on update detected

### 2. Make Updates Non-Intrusive

Position toast where it's visible but doesn't block interaction.

✅ **Good**: Top-center toast with "Later" option
❌ **Bad**: Modal that blocks the entire app

### 3. Communicate Update Benefits

Tell users what's new (in future enhancement).

✅ **Good**: "Update available with bug fixes and new features"
❌ **Bad**: Just "Update available"

### 4. Handle Updates During Critical Actions

Don't interrupt users during important tasks.

✅ **Good**: Allow "Later" option
❌ **Bad**: Force update while user is filling a form

### 5. Test Thoroughly

Test update flow in production-like environment.

✅ **Good**: Test with real builds, real domains
❌ **Bad**: Only test in development

---

## Future Enhancements

### 1. Show Changelog

Display what's new in the update:

```tsx
<UpdatePrompt changelog={[
  "Fixed bug in calendar view",
  "Added new dark mode",
  "Improved performance"
]} />
```

### 2. Version Numbers

Show current and new version:

```tsx
<p>Current: v1.0.0 → New: v1.1.0</p>
```

### 3. Update History

Track and display update history:

```tsx
<UpdateHistory updates={[
  { version: "1.1.0", date: "2024-01-15", changes: [...] },
  { version: "1.0.0", date: "2024-01-01", changes: [...] }
]} />
```

### 4. Background Downloads

Pre-download updates in background:

```typescript
// Workbox feature - download but don't activate
workbox.register({ updateViaCache: 'none' });
```

### 5. Staged Rollouts

Release updates gradually:

```typescript
// Show update to 10% of users first
if (Math.random() < 0.1) {
  showUpdatePrompt();
}
```

---

## Analytics (Optional)

Track update effectiveness:

```tsx
// In UpdatePrompt component
const handleUpdate = () => {
  // Track analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'pwa_update_accepted', {
      event_category: 'PWA',
      event_label: 'Service Worker Update',
    });
  }

  updateServiceWorker();
  toast.info("Updating app...");
};
```

Track metrics:
- Update availability rate
- Update acceptance rate
- Time to update after notification
- Update dismissal rate
- Version distribution

---

## Files Created

- `hooks/useServiceWorkerUpdate.ts` - Update detection hook
- `components/pwa/update-prompt.tsx` - Auto-update toast
- `documentation/PWA-UPDATE-PROMPTS.md` - This file

## Files Modified

- `components/providers.tsx` - Added UpdatePrompt
- `components/widgets/settings/pwa-install-card.tsx` - Added update section

---

## Summary

The service worker update system provides a seamless way for users to get the latest version of your PWA. It automatically detects updates, notifies users, and handles the update process gracefully.

**Key Features**:
- ✅ Automatic update detection (60s intervals + focus)
- ✅ Non-intrusive toast notifications
- ✅ Manual update check in Settings
- ✅ Seamless update and reload process
- ✅ No data loss during updates
- ✅ Visual feedback (loading states)

**User Benefits**:
- Always running latest version
- Bug fixes and features arrive quickly
- No manual download/install process
- Non-disruptive update flow
- Control over when to update

**Developer Benefits**:
- Easy to deploy updates
- High adoption rate
- Automatic rollout
- No user intervention needed
- Built-in update tracking

---

## Related Documentation

- [PWA Install Prompts](./PWA-INSTALL-PROMPTS.md)
- [PWA Implementation Plan](./PWA-IMPLEMENTATION.md)
- [Phase 1 Summary](./PWA-PHASE1-SUMMARY.md)
