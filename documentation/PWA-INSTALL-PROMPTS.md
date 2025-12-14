# PWA Install Prompts - Implementation Guide

## Overview

Custom install prompts provide a better user experience for installing your PWA compared to browser defaults. This implementation includes:

1. **Smart install prompts** - Automatic toast notifications after 2 page views
2. **Settings page integration** - Manual install option with platform-specific instructions
3. **PWA status badge** - Shows when running as installed app
4. **Cross-platform support** - Desktop (Chrome/Edge), Android, and iOS

---

## Components

### 1. `useInstallPrompt` Hook

**Location**: `hooks/useInstallPrompt.ts`

**Purpose**: Manages PWA installation state and handles the `beforeinstallprompt` event.

**Returns**:
- `installPrompt` - The captured install prompt event
- `canInstall` - Boolean indicating if install is available
- `isInstalled` - Boolean indicating if app is installed
- `isStandalone` - Boolean indicating if running in standalone mode
- `promptInstall()` - Function to trigger the install prompt

**Usage**:
```tsx
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

function MyComponent() {
  const { canInstall, promptInstall, isInstalled } = useInstallPrompt();

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      console.log("App installed!");
    }
  };

  return (
    <button onClick={handleInstall} disabled={!canInstall || isInstalled}>
      Install App
    </button>
  );
}
```

**Features**:
- Captures `beforeinstallprompt` event automatically
- Detects standalone mode (installed app)
- Listens for `appinstalled` event
- Prevents browser's default mini-infobar

---

### 2. `InstallPrompt` Component

**Location**: `components/pwa/install-prompt.tsx`

**Purpose**: Automatically shows install toast after minimum page views.

**Features**:
- Shows after 2 page views (configurable)
- 2-second delay before showing (non-intrusive)
- Three action buttons:
  - **Install** - Triggers installation
  - **Not now** - Dismisses temporarily
  - **Don't show again** - Dismisses permanently
- Stores dismissal preference in localStorage
- Tracks page views in localStorage
- Auto-dismisses after 30 seconds
- Positioned at bottom-center

**Storage Keys**:
- `pwa-install-prompt-dismissed` - Permanent dismissal flag
- `pwa-page-views` - Page view counter

**Integration**:
Added to `components/providers.tsx` - runs globally throughout the app.

---

### 3. `PWAStatus` Badge

**Location**: `components/pwa/pwa-status.tsx`

**Purpose**: Shows badge when app is running in standalone mode.

**Features**:
- Only visible when installed
- Shows "Running as app" text
- Displays device type icon (Monitor/Smartphone)
- Uses Badge component from UI library

**Usage**:
```tsx
import { PWAStatus } from "@/components/pwa/pwa-status";

function Header() {
  return (
    <div>
      <h1>My App</h1>
      <PWAStatus />
    </div>
  );
}
```

---

### 4. `PWAInstallCard` Component

**Location**: `components/widgets/settings/pwa-install-card.tsx`

**Purpose**: Full-featured install section for Settings page.

**Features**:

**Installation Status**:
- ✅ Shows "App Installed" if already installed
- Shows install button if available
- Shows "not available" message for unsupported browsers

**Platform Detection**:
- Detects iOS, Android, and desktop
- Shows platform-specific instructions
- Adapts UI based on device type

**Instructions Provided**:
- **Desktop (Chrome/Edge)**: Address bar install icon
- **iOS (Safari)**: Share → Add to Home Screen
- **Android (Chrome)**: Menu → Install app

**Features List**:
- Quick access from desktop/home screen
- Offline support
- Native app experience
- Fast loading with caching
- Background sync

**Integration**:
Added to `app/(dashboard)/settings/page.tsx` - visible to all authenticated users.

---

## User Flow

### First-Time User (Desktop)

1. User visits the site
2. Browser captures `beforeinstallprompt` event
3. After 2 page views, toast notification appears:
   - "Install Homepage"
   - Explanation of benefits
   - Install / Not now / Don't show again buttons
4. User clicks "Install":
   - Browser's install dialog appears
   - User confirms
   - App installed and opens in new window
5. On next visit, PWAStatus badge shows "Running as app"

### First-Time User (iOS Safari)

1. User visits the site
2. Toast doesn't appear (iOS doesn't support `beforeinstallprompt`)
3. User goes to Settings page
4. Sees PWAInstallCard with iOS-specific instructions:
   - Tap Share button
   - Scroll to "Add to Home Screen"
   - Tap "Add"
5. App icon appears on home screen
6. Opens as fullscreen web app

### Returning User (Already Installed)

1. Opens app from desktop/home screen
2. App loads in standalone mode
3. PWAStatus badge visible throughout app
4. Settings page shows "App Installed" status
5. Install prompts never appear

---

## Configuration

### Customize Page View Threshold

In `components/pwa/install-prompt.tsx`:

```tsx
const MIN_PAGE_VIEWS = 2; // Change to desired number
```

### Customize Delay Before Showing

In `components/pwa/install-prompt.tsx`:

```tsx
const timer = setTimeout(() => {
  setShouldShow(true);
  showInstallToast();
}, 2000); // Change to desired delay in ms
```

### Customize Toast Duration

In `components/pwa/install-prompt.tsx`:

```tsx
toast.custom(
  (t) => (
    // ... toast content
  ),
  {
    duration: 30000, // Change to desired duration in ms
    position: "bottom-center", // Or "top-center", "bottom-right", etc.
  }
);
```

### Reset Dismissal for Testing

Open browser console and run:

```javascript
localStorage.removeItem('pwa-install-prompt-dismissed');
localStorage.removeItem('pwa-page-views');
```

Then refresh the page.

---

## Testing

### Test Install Prompt (Desktop)

1. Build production: `npx next build --webpack`
2. Start server: `npm start`
3. Open http://localhost:3000 in Chrome/Edge
4. Navigate to 2+ different pages
5. Wait 2 seconds after 2nd page
6. Toast should appear at bottom
7. Click "Install" → Browser dialog appears
8. Confirm installation
9. App opens in standalone window
10. Check Start Menu for app icon

### Test Install Prompt (Mobile)

**Android Chrome**:
1. Visit site on mobile device
2. Navigate 2+ pages
3. Toast appears
4. Click "Install"
5. Confirm in Android dialog
6. App appears in app drawer

**iOS Safari**:
1. Visit site in Safari
2. Toast won't appear (expected)
3. Go to Settings page
4. See iOS-specific instructions
5. Follow instructions manually
6. App appears on home screen

### Test Settings Page

1. Visit `/settings` page
2. Find "Install App" card
3. If not installed:
   - See "Install Now" button
   - See platform-specific instructions
   - See features list
4. If installed:
   - See "App Installed" success message
   - See PWA status badge
5. Click install button (if available)
6. Verify installation works

### Test PWA Status Badge

1. Install the app
2. Open in standalone mode
3. Look for badge showing:
   - "Running as app" text
   - Checkmark icon
   - Device type icon (Monitor or Smartphone)
4. Badge should appear in Settings page header

---

## Browser Support

### Desktop Browsers

| Browser | Install Prompt | Settings Manual Install | Notes |
|---------|----------------|------------------------|-------|
| Chrome 90+ | ✅ Yes | ✅ Yes | Full support |
| Edge 90+ | ✅ Yes | ✅ Yes | Full support |
| Firefox | ❌ No | ⚠️ Partial | Limited PWA support |
| Safari | ❌ No | ⚠️ Manual | Add to Dock only |

### Mobile Browsers

| Browser | Install Prompt | Settings Manual Install | Notes |
|---------|----------------|------------------------|-------|
| Chrome (Android) | ✅ Yes | ✅ Yes | Full support |
| Edge (Android) | ✅ Yes | ✅ Yes | Full support |
| Samsung Internet | ✅ Yes | ✅ Yes | Full support |
| Safari (iOS) | ❌ No | ✅ Yes | Manual via Share |

---

## Troubleshooting

### Install Prompt Never Appears

**Possible Causes**:
1. Not using HTTPS (localhost is OK)
2. Service worker not registered
3. Manifest not found or invalid
4. Already installed
5. User previously dismissed permanently
6. Less than 2 page views
7. Browser doesn't support (Firefox, Safari)

**Solutions**:
- Check DevTools Console for errors
- Verify service worker in Application tab
- Check manifest in Application tab
- Reset localStorage (see Configuration)
- Increase page views counter
- Test in Chrome/Edge

### "Install" Button Disabled

**Possible Causes**:
1. `beforeinstallprompt` event not fired
2. App already installed
3. Browser doesn't support installation

**Solutions**:
- Check console for event logs
- Use Settings page for platform-specific instructions
- Try different browser (Chrome/Edge)

### iOS Install Instructions Not Showing

**Possible Causes**:
1. Not detected as iOS device
2. Platform detection failing

**Solutions**:
- Check user agent string
- Force iOS instructions by testing `isIOS` variable
- Verify device in browser DevTools

### App Not Opening in Standalone Mode

**Possible Causes**:
1. Opened from browser instead of icon
2. Manifest `display` not set correctly
3. Scope configuration issue

**Solutions**:
- Close browser tab and open from app icon/shortcut
- Verify `display: "standalone"` in manifest
- Check `start_url` and `scope` in manifest

---

## Best Practices

### 1. Don't Show Immediately

Wait for 2+ page views before prompting. Users need to understand the value first.

### 2. Respect User Choice

If user dismisses, respect their decision. Don't show again unless they clear storage.

### 3. Provide Value Messaging

Explain benefits clearly:
- Faster loading
- Offline access
- Quick access from home screen
- Native app experience

### 4. Platform-Specific Instructions

Provide clear instructions for each platform. What works on Chrome doesn't work on iOS.

### 5. Fallback for Unsupported Browsers

Always provide Settings page option as fallback for browsers that don't support automatic prompts.

### 6. Test Across Devices

Test on actual devices, not just emulators. Real-world behavior differs.

---

## Analytics (Optional)

Track install prompt effectiveness:

```tsx
// In InstallPrompt component
const handleInstall = async () => {
  const installed = await promptInstall();

  // Track analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', installed ? 'pwa_install_accepted' : 'pwa_install_dismissed', {
      event_category: 'PWA',
      event_label: navigator.userAgent,
    });
  }

  if (installed) {
    toast.success("App installed successfully!");
  }
};
```

Track metrics:
- Install prompt shown count
- Install acceptance rate
- Install dismissal rate
- Platform distribution
- Time to install after first visit

---

## Future Enhancements

1. **A/B Testing**: Test different messaging and timing
2. **Personalized Prompts**: Show different prompts based on user behavior
3. **Feature Tours**: Show app features after installation
4. **Re-engagement**: Prompt users who haven't visited in a while
5. **Update Notifications**: Prompt users to update when new version available

---

## Files Created

- `hooks/useInstallPrompt.ts` - Main hook for install state
- `components/pwa/install-prompt.tsx` - Auto-prompt toast
- `components/pwa/pwa-status.tsx` - Status badge
- `components/widgets/settings/pwa-install-card.tsx` - Settings card
- `documentation/PWA-INSTALL-PROMPTS.md` - This file

## Files Modified

- `components/providers.tsx` - Added InstallPrompt
- `app/(dashboard)/settings/page.tsx` - Added PWAInstallCard

---

## Summary

The install prompt system provides a comprehensive, user-friendly way to install your PWA across all platforms. It respects user preferences, provides clear instructions, and adapts to different browsers and devices.

**Key Features**:
- ✅ Automatic smart prompts (after 2 page views)
- ✅ Manual install option in Settings
- ✅ Platform-specific instructions
- ✅ PWA status indicator
- ✅ Dismissal persistence
- ✅ Cross-platform support

**User Benefits**:
- Clear value proposition
- Non-intrusive prompts
- Easy installation process
- Platform-specific guidance
- Manual fallback option

**Developer Benefits**:
- Easy to customize
- Well-documented
- TypeScript support
- Follows best practices
- Analytics-ready
