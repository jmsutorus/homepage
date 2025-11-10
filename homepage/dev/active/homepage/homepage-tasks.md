# Homepage Project - Task Checklist

**Last Updated**: 2025-11-10

## Progress Overview

- **Timeline**: 8 weeks to MVP
- **Current Phase**: Not started
- **Next Milestone**: Phase 1 - Foundation & Infrastructure

---

## Phase 1: Foundation & Infrastructure (Weeks 1-2)

### 1.1 Project Setup
**Status**: ⬜ Not Started | **Effort**: Medium (M)

- [ ] Initialize Next.js 15 project with TypeScript
  - [ ] Run `npx create-next-app@latest homepage --typescript --tailwind --app --eslint`
  - [ ] Verify `npm run dev` starts successfully
  - [ ] Configure `tsconfig.json` for strict mode

- [ ] Install and configure shadcn/ui
  - [ ] Run `npx shadcn@latest init`
  - [ ] Install initial components: Button, Card, Dialog, Sheet, Tabs
  - [ ] Configure theme colors in `tailwind.config.ts`
  - [ ] Verify can import and use shadcn components

- [ ] Set up project structure
  - [ ] Create `components/ui/` for shadcn components
  - [ ] Create `components/widgets/` for dashboard widgets
  - [ ] Create `components/layout/` for layout components
  - [ ] Create `lib/db/` for database utilities
  - [ ] Create `lib/api/` for API clients
  - [ ] Create `content/media/movies/` for movie markdown files
  - [ ] Create `content/media/tv/` for TV markdown files
  - [ ] Create `content/media/books/` for book markdown files
  - [ ] Create `content/journal/` for journal entries
  - [ ] Create `config/` for configuration files
  - [ ] Create `data/` for SQLite database (add to .gitignore)
  - [ ] Add README.md files to each directory

- [ ] Configure environment variables
  - [ ] Create `.env.example` with all required variables
  - [ ] Create `.env.local` from template (gitignored)
  - [ ] Install `@t3-oss/env-nextjs` for type-safe env vars
  - [ ] Create `lib/env.ts` with Zod validation
  - [ ] Document required API keys in README

- [ ] Initialize Git repository
  - [ ] Update .gitignore (add `.env.local`, `data/`, `node_modules/`, `.next/`)
  - [ ] Create initial commit
  - [ ] Verify no secrets committed

**Deliverable**: Runnable Next.js project with shadcn/ui configured

---

### 1.2 Database Setup
**Status**: ⬜ Not Started | **Effort**: Medium (M)

- [ ] Install database dependencies
  - [ ] `npm install better-sqlite3`
  - [ ] `npm install -D @types/better-sqlite3`
  - [ ] Verify packages installed successfully

- [ ] Create database schema
  - [ ] Create `lib/db/schema.sql` with tables:
    - [ ] `mood_entries` table (id, date, rating, note, created_at)
    - [ ] `tasks` table (id, title, completed, due_date, priority, created_at)
    - [ ] `api_cache` table (key, value, expires_at)
  - [ ] Add indexes for performance (date, key)

- [ ] Create database utility functions
  - [ ] `lib/db/index.ts`: Database connection singleton
  - [ ] `lib/db/mood.ts`: Mood CRUD operations
    - [ ] `createMoodEntry(date, rating, note)`
    - [ ] `getMoodEntry(date)`
    - [ ] `getMoodEntriesInRange(startDate, endDate)`
    - [ ] `updateMoodEntry(date, rating, note)`
    - [ ] `deleteMoodEntry(date)`
  - [ ] `lib/db/tasks.ts`: Task CRUD operations
    - [ ] `createTask(title, dueDate, priority)`
    - [ ] `getTask(id)`
    - [ ] `getAllTasks(filter)`
    - [ ] `updateTask(id, updates)`
    - [ ] `deleteTask(id)`
  - [ ] `lib/db/cache.ts`: API cache operations
    - [ ] `getCachedValue(key)`
    - [ ] `setCachedValue(key, value, ttl)`
    - [ ] `invalidateCache(keyPattern)`
  - [ ] Verify can query database from code

- [ ] Create database scripts
  - [ ] `lib/db/migrate.ts`: Run migrations
  - [ ] `lib/db/seed.ts`: Seed with sample data
    - [ ] Add 30 days of sample mood entries
    - [ ] Add 10 sample tasks
  - [ ] Add npm scripts: `db:migrate`, `db:seed`, `db:reset`
  - [ ] Verify `npm run db:seed` populates database

**Deliverable**: Working SQLite database with CRUD operations

---

### 1.3 Layout & Navigation
**Status**: ⬜ Not Started | **Effort**: Large (L)

- [ ] Create root layout
  - [ ] `app/layout.tsx` with HTML structure
  - [ ] Configure metadata (title, description)
  - [ ] Install and configure fonts: `next/font/google` (Inter, Fira Code)
  - [ ] Install `next-themes` for dark mode
  - [ ] Create `components/providers.tsx` with ThemeProvider
  - [ ] Verify basic HTML renders with fonts

- [ ] Build header component
  - [ ] `components/layout/header.tsx` with logo/branding
  - [ ] Theme toggle button component
  - [ ] Navigation links for desktop
  - [ ] Hamburger menu for mobile
  - [ ] Verify header is responsive on all screen sizes

- [ ] Implement theme switcher
  - [ ] `components/layout/theme-toggle.tsx` with sun/moon icons
  - [ ] Use `next-themes` useTheme hook
  - [ ] Persist theme selection to localStorage
  - [ ] Support system preference detection
  - [ ] Verify theme switches between light/dark modes without flicker

- [ ] Create dashboard grid layout
  - [ ] `components/dashboard-grid.tsx` with responsive grid
  - [ ] Breakpoints: mobile (1 col), tablet (2 col), desktop (3-4 col)
  - [ ] Widget placeholder cards with mock data
  - [ ] Verify grid adapts to screen sizes (test at 320px, 768px, 1280px, 1920px)

- [ ] Add navigation structure
  - [ ] Create `app/(dashboard)/layout.tsx` for dashboard routes
  - [ ] `components/layout/sidebar.tsx` navigation component
  - [ ] Route structure:
    - [ ] `/` - Main dashboard page
    - [ ] `/mood` - Mood tracker page
    - [ ] `/media` - Media library page
    - [ ] `/exercise` - Exercise tracking page (placeholder)
    - [ ] `/tasks` - Task manager page
  - [ ] `components/layout/nav-menu.tsx` with route links
  - [ ] Verify can navigate between pages with client-side routing

**Deliverable**: Responsive dashboard layout with navigation

---

## Phase 2: Core Content Features (Weeks 3-4)

### 2.1 Markdown-Based Media Tracking
**Status**: ⬜ Not Started | **Effort**: Large (L)

- [ ] Set up Markdown processing
  - [ ] Install `npm install gray-matter next-mdx-remote remark-gfm rehype-highlight`
  - [ ] Create `lib/mdx.ts` utilities
    - [ ] `getMediaFiles(directory)` - List all .md files
    - [ ] `getMediaBySlug(slug)` - Read and parse single file
    - [ ] `getAllMedia()` - Get all media with frontmatter
    - [ ] `parseMarkdown(content)` - Render MDX to JSX
  - [ ] Verify can read and parse Markdown files

- [ ] Create sample media content
  - [ ] Add 5 sample movies in `content/media/movies/`:
    - [ ] the-matrix.md, inception.md, interstellar.md, etc.
  - [ ] Add 5 sample TV shows in `content/media/tv/`:
    - [ ] breaking-bad.md, the-office.md, etc.
  - [ ] Each with frontmatter: title, type, status, rating, imageUrl, dateWatched
  - [ ] Add sample poster images to `public/images/media/`
  - [ ] Verify frontmatter parsing works

- [ ] Build media card component
  - [ ] `components/widgets/media-card.tsx` using shadcn Card
  - [ ] Display poster image (next/image)
  - [ ] Display title and rating (stars or numbers)
  - [ ] Status badge (watching, completed, planned)
  - [ ] Hover effects (scale, shadow)
  - [ ] Click handler to open detail view
  - [ ] Verify card displays media metadata correctly

- [ ] Create media grid page
  - [ ] `app/(dashboard)/media/page.tsx`
  - [ ] Load all Markdown files at build time (generateStaticParams)
  - [ ] `components/widgets/media-grid.tsx` responsive grid
  - [ ] Filter tabs by type (All, Movies, TV, Books)
  - [ ] Search input for filtering by title
  - [ ] Sort options (title, rating, date watched)
  - [ ] Verify `/media` page shows all media items

- [ ] Implement media detail view
  - [ ] `app/(dashboard)/media/[slug]/page.tsx`
  - [ ] Display full Markdown content (MDX rendered)
  - [ ] Show all metadata in sidebar
  - [ ] "Edit" link (opens VSCode with command: `vscode://file/...`)
  - [ ] Back button to media grid
  - [ ] Verify can view full media details and notes

**Deliverable**: Functional media library with Markdown support

---

### 2.2 Quick Links Widget
**Status**: ⬜ Not Started | **Effort**: Small (S)

- [ ] Design links configuration format
  - [ ] Create `config/links.json` with structure:
    ```json
    {
      "categories": [
        {
          "name": "Development",
          "links": [
            { "title": "GitHub", "url": "https://github.com", "icon": "github" }
          ]
        }
      ]
    }
    ```
  - [ ] Add 3-4 sample categories with 5-10 links total
  - [ ] Document JSON schema in README

- [ ] Build link card component
  - [ ] `components/widgets/link-card.tsx` with compact design
  - [ ] Icon support (Lucide icons)
  - [ ] Click opens link in new tab (`target="_blank"`)
  - [ ] Hover effects (background color change)
  - [ ] Verify link card displays correctly

- [ ] Create quick links widget
  - [ ] `components/widgets/quick-links.tsx`
  - [ ] Read from `config/links.json`
  - [ ] Display in category groups (collapsible sections)
  - [ ] Responsive grid layout (2-4 columns)
  - [ ] Verify widget shows all links from config

- [ ] Add links to dashboard
  - [ ] Place widget on main dashboard page (`app/(dashboard)/page.tsx`)
  - [ ] Position in grid layout (top section)
  - [ ] Verify links are accessible from homepage

**Deliverable**: Functional quick links widget

---

## Phase 3: Interactive Widgets (Weeks 3-4)

### 3.1 Mood Tracker (Year in Pixels)
**Status**: ⬜ Not Started | **Effort**: Extra Large (XL)

- [ ] Install visualization library
  - [ ] `npm install @uiw/react-heat-map`
  - [ ] Test component renders correctly
  - [ ] Verify library works with Next.js (client component)

- [ ] Create mood entry component
  - [ ] `components/widgets/mood-entry-modal.tsx` using shadcn Dialog/Sheet
  - [ ] Mood selector (1-5 rating with emoji or color buttons)
  - [ ] Optional note textarea
  - [ ] Date picker for backfilling (use shadcn Calendar)
  - [ ] Save button with validation (Zod schema)
  - [ ] Verify can select mood and save to database

- [ ] Build mood heatmap component
  - [ ] `components/widgets/mood-tracker.tsx`
  - [ ] Use @uiw/react-heat-map with custom colors:
    - [ ] 1 = Red (bad)
    - [ ] 2 = Orange
    - [ ] 3 = Yellow (neutral)
    - [ ] 4 = Light green
    - [ ] 5 = Green (great)
  - [ ] Load data from API endpoint
  - [ ] Click day to open entry modal
  - [ ] Tooltip showing mood rating and note on hover
  - [ ] Verify heatmap displays year of mood data

- [ ] Create API routes for mood data
  - [ ] `app/api/mood/route.ts`:
    - [ ] `POST` - Create/update mood entry
    - [ ] `GET` - Get mood entries (with date/range query params)
  - [ ] Request validation with Zod
  - [ ] Error handling (try/catch, return proper status codes)
  - [ ] Verify API routes work with database

- [ ] Add mood tracker to dashboard
  - [ ] Create dedicated page at `app/(dashboard)/mood/page.tsx`
  - [ ] Add widget to main dashboard (shows current month preview)
  - [ ] Link from dashboard widget to full page
  - [ ] Verify mood tracker is fully functional

**Deliverable**: Fully functional mood tracker with year view

---

### 3.2 Task Manager
**Status**: ⬜ Not Started | **Effort**: Large (L)

- [ ] Create task form component
  - [ ] `components/widgets/task-form.tsx`
  - [ ] Input field for task title (auto-focus)
  - [ ] Optional due date/time picker (shadcn Popover + Calendar)
  - [ ] Priority selector (low, medium, high) with color badges
  - [ ] Add button with keyboard shortcut (Ctrl+Enter)
  - [ ] Verify can create new tasks

- [ ] Build task list component
  - [ ] `components/widgets/task-list.tsx`
  - [ ] Display all tasks from API
  - [ ] Checkbox to mark complete (with strikethrough animation)
  - [ ] Delete button (with confirmation dialog)
  - [ ] Edit in-place functionality (double-click title)
  - [ ] Filter buttons: All, Active, Completed
  - [ ] Verify task list displays and updates

- [ ] Add task sorting and filtering
  - [ ] Sort by: Due date, Priority, Created date
  - [ ] Filter by: Status (all/active/completed), Priority
  - [ ] Search functionality (filter by title)
  - [ ] Persist filter/sort preferences to localStorage
  - [ ] Verify can sort and filter tasks

- [ ] Create API routes for tasks
  - [ ] `app/api/tasks/route.ts`:
    - [ ] `POST` - Create task
    - [ ] `GET` - Get all tasks (with filter query params)
  - [ ] `app/api/tasks/[id]/route.ts`:
    - [ ] `PATCH` - Update task
    - [ ] `DELETE` - Delete task
  - [ ] Request validation with Zod
  - [ ] Verify API CRUD operations work

- [ ] Add tasks to dashboard
  - [ ] Create dedicated page at `app/(dashboard)/tasks/page.tsx`
  - [ ] Add widget to main dashboard (shows top 5 upcoming tasks)
  - [ ] Link from dashboard widget to full page
  - [ ] Verify tasks are accessible and functional

**Deliverable**: Functional task manager

---

## Phase 4: API Integrations (Weeks 5-7)

### 4.1 Strava Exercise Tracking (Priority 1)
**Status**: ⬜ Not Started | **Effort**: Extra Large (XL)

- [ ] Register Strava API application
  - [ ] Go to https://www.strava.com/settings/api
  - [ ] Create new application
  - [ ] Note Client ID and Client Secret
  - [ ] Set callback URL: `http://localhost:3000/api/auth/callback/strava`
  - [ ] Add to `.env.local`

- [ ] Set up NextAuth.js with Strava provider
  - [ ] Install `npm install next-auth@beta` (v5)
  - [ ] Create `app/api/auth/[...nextauth]/route.ts`
  - [ ] Configure Strava OAuth provider
  - [ ] Set up JWT session strategy
  - [ ] Implement token refresh logic
  - [ ] Verify OAuth flow works, can login with Strava

- [ ] Create Strava API client
  - [ ] `lib/api/strava.ts` with fetch wrappers
  - [ ] `getAthleteActivities(accessToken, options)` - List activities
  - [ ] `getActivityDetails(accessToken, activityId)` - Activity details
  - [ ] Token refresh logic (if token expired)
  - [ ] Error handling and rate limiting (100/15min)
  - [ ] Verify can fetch activities from Strava

- [ ] Build exercise stats widget
  - [ ] `components/widgets/exercise-stats.tsx`
  - [ ] Display recent runs (last 7 days)
  - [ ] Stats cards: Total distance, Average pace, Elevation gain
  - [ ] "This Week" summary section
  - [ ] Link to full activity on Strava (external link)
  - [ ] Verify widget displays recent exercise data

- [ ] Create exercise charts
  - [ ] Install `npm install recharts`
  - [ ] `components/widgets/exercise-chart.tsx`
  - [ ] Line chart: Distance over time (last 30 days)
  - [ ] Bar chart: Weekly distance comparison
  - [ ] Personal records display (fastest 5K, longest run)
  - [ ] Verify charts display Strava data

- [ ] Create API routes for Strava
  - [ ] `app/api/strava/activities/route.ts`:
    - [ ] `GET` - Fetch recent activities
    - [ ] Check cache first (15-minute TTL)
    - [ ] Proxy to Strava API with user's token
    - [ ] Store response in cache
  - [ ] `app/api/strava/stats/route.ts`:
    - [ ] `GET` - Aggregate stats from activities
  - [ ] Verify API routes work and respect cache

- [ ] Add exercise widget to dashboard
  - [ ] Place on main dashboard
  - [ ] Create dedicated page at `app/(dashboard)/exercise/page.tsx`
  - [ ] Verify exercise data visible on dashboard

**Deliverable**: Functional Strava integration with charts

---

### 4.2 Steam Gaming Status (Priority 2)
**Status**: ⬜ Not Started | **Effort**: Medium (M)

- [ ] Register Steam API key
  - [ ] Go to https://steamcommunity.com/dev
  - [ ] Register for API key (requires Steam account)
  - [ ] Note API key and your Steam ID (64-bit)
  - [ ] Add to `.env.local`: `STEAM_API_KEY`, `STEAM_ID`

- [ ] Create Steam API client
  - [ ] `lib/api/steam.ts` with fetch wrappers
  - [ ] `getPlayerSummary(steamId)` - User profile and online status
  - [ ] `getRecentlyPlayedGames(steamId)` - Recent games
  - [ ] `getOwnedGames(steamId)` - Full library (optional)
  - [ ] Error handling (profile must be public)
  - [ ] Verify can fetch Steam data

- [ ] Create API routes for Steam
  - [ ] `app/api/steam/status/route.ts`:
    - [ ] `GET` - Current player status
    - [ ] Check cache first (5-minute TTL)
    - [ ] Proxy to Steam API
    - [ ] Return online status and currently playing game
  - [ ] `app/api/steam/recent/route.ts`:
    - [ ] `GET` - Recently played games
    - [ ] Include playtime and game artwork
  - [ ] Verify API routes return Steam data

- [ ] Build Steam status widget
  - [ ] `components/widgets/steam-status.tsx`
  - [ ] Display currently playing game (if online)
  - [ ] Show game artwork (header image)
  - [ ] Recent games list with playtime
  - [ ] Online status indicator (green = online, gray = offline)
  - [ ] Verify widget displays Steam status

- [ ] Add Steam widget to dashboard
  - [ ] Place on main dashboard
  - [ ] Show compact view (expand for recent games)
  - [ ] Verify Steam status visible on dashboard

**Deliverable**: Functional Steam integration

---

### 4.3 Home Assistant Integration (Priority 3)
**Status**: ⬜ Not Started | **Effort**: Large (L)

- [ ] Set up Home Assistant access
  - [ ] Generate Long-Lived Access Token from HA profile
  - [ ] Note Home Assistant URL (e.g., `http://homeassistant.local:8123`)
  - [ ] Document accessible entities (sensors, switches, etc.)
  - [ ] Add to `.env.local`: `HOMEASSISTANT_URL`, `HOMEASSISTANT_TOKEN`

- [ ] Create Home Assistant configuration
  - [ ] Create `config/homeassistant.json` with entity list:
    ```json
    {
      "sensors": [
        { "entityId": "sensor.living_room_temperature", "name": "Living Room Temp" },
        { "entityId": "sensor.bedroom_humidity", "name": "Bedroom Humidity" }
      ]
    }
    ```
  - [ ] Add 5-10 entities you want to display

- [ ] Create Home Assistant API client
  - [ ] `lib/api/homeassistant.ts` with fetch wrappers
  - [ ] `getStates(baseUrl, token)` - Get all entity states
  - [ ] `getState(baseUrl, token, entityId)` - Get specific entity
  - [ ] `callService(baseUrl, token, domain, service, data)` - Control devices (future)
  - [ ] Error handling (HA offline, invalid entity)
  - [ ] Verify can fetch HA data

- [ ] Create API routes for Home Assistant
  - [ ] `app/api/homeassistant/sensors/route.ts`:
    - [ ] `GET` - Get configured sensor values
    - [ ] Check cache first (1-minute TTL)
    - [ ] Fetch from HA API
    - [ ] Return sensor data
  - [ ] `app/api/homeassistant/state/[entityId]/route.ts`:
    - [ ] `GET` - Get specific entity state
  - [ ] Verify API routes return HA data

- [ ] Build Home Assistant widget
  - [ ] `components/widgets/home-assistant-widget.tsx`
  - [ ] Display sensor values from config file
  - [ ] Format units (°F, %, etc.)
  - [ ] Status indicators (green/red for binary sensors)
  - [ ] Link to full HA dashboard (external link)
  - [ ] Offline badge if HA unreachable
  - [ ] Verify widget displays HA sensors

- [ ] Add Home Assistant widget to dashboard
  - [ ] Place on main dashboard
  - [ ] Verify HA data visible on dashboard

**Deliverable**: Functional Home Assistant integration

---

### 4.4 Plex Server Monitoring
**Status**: ⬜ Not Started | **Effort**: Large (L)

- [ ] Set up Tautulli access
  - [ ] Install Tautulli (if not already running)
  - [ ] Enable API in Tautulli settings
  - [ ] Note API key and Tautulli URL
  - [ ] Add to `.env.local`: `TAUTULLI_URL`, `TAUTULLI_API_KEY`

- [ ] Create Tautulli API client
  - [ ] `lib/api/tautulli.ts` with fetch wrappers
  - [ ] `getActivity()` - Current streams
  - [ ] `getLibraries()` - Library stats
  - [ ] `getRecentlyAdded()` - New media
  - [ ] `getHomeStats()` - Top content (optional)
  - [ ] Error handling (Tautulli down, Plex server offline)
  - [ ] Verify can fetch Tautulli data

- [ ] Create API routes for Plex/Tautulli
  - [ ] `app/api/plex/activity/route.ts`:
    - [ ] `GET` - Current streams
    - [ ] Check cache first (2-minute TTL)
    - [ ] Return stream info (user, device, quality)
  - [ ] `app/api/plex/recent/route.ts`:
    - [ ] `GET` - Recently added media
    - [ ] Include posters and metadata
  - [ ] `app/api/plex/stats/route.ts`:
    - [ ] `GET` - Server stats (library size, etc.)
  - [ ] Verify API routes return Plex data

- [ ] Build Plex status widget
  - [ ] `components/widgets/plex-status.tsx`
  - [ ] Server online/offline indicator
  - [ ] Currently streaming content (if any)
    - [ ] Show title, user, device
    - [ ] Progress bar for playback
  - [ ] Recently added media with posters (horizontal scroll)
  - [ ] Library size stats (total movies, TV shows)
  - [ ] Link to Tautulli or Plex web interface
  - [ ] Verify widget displays Plex status

- [ ] Add Plex widget to dashboard
  - [ ] Place on main dashboard
  - [ ] Verify Plex status visible on dashboard

**Deliverable**: Functional Plex server monitoring

---

## Phase 5: Docker Deployment (Week 8)

### 5.1 Docker Configuration
**Status**: ⬜ Not Started | **Effort**: Medium (M)

- [ ] Create Dockerfile
  - [ ] Multi-stage build (builder + runner stages)
  - [ ] Use Node 20 Alpine base image
  - [ ] Builder stage:
    - [ ] Copy package.json and package-lock.json
    - [ ] Run `npm ci`
    - [ ] Copy source files
    - [ ] Run `npm run build`
  - [ ] Runner stage:
    - [ ] Copy node_modules and build output
    - [ ] Expose port 3000
    - [ ] CMD: `npm start`
  - [ ] Verify Docker image builds successfully

- [ ] Create docker-compose.yml
  - [ ] Define homepage service
  - [ ] Port mapping: `3000:3000`
  - [ ] Volume mounts:
    - [ ] `./data:/app/data` (SQLite database)
    - [ ] `./content:/app/content` (Markdown files)
  - [ ] Environment variables from .env file
  - [ ] Restart policy: `unless-stopped`
  - [ ] Verify `docker-compose up` starts container

- [ ] Create .dockerignore
  - [ ] Exclude `node_modules/`, `.next/`, `.git/`
  - [ ] Exclude `.env.local`, `data/`, `Research/`
  - [ ] Optimize build context size
  - [ ] Verify Docker build is fast and efficient

- [ ] Document Docker deployment
  - [ ] Update README.md with Docker instructions
  - [ ] Environment variable documentation
  - [ ] Volume mount documentation
  - [ ] Example .env file for Docker
  - [ ] Verify can deploy following README

- [ ] Test Docker deployment
  - [ ] Build image: `docker build -t homepage .`
  - [ ] Run container: `docker-compose up -d`
  - [ ] Verify all features work in container
  - [ ] Test persistence (stop/start container, data remains)
  - [ ] Test environment variables loaded correctly
  - [ ] Verify all API integrations work from container

**Deliverable**: Docker container ready for self-hosting

---

### 5.2 Production Optimization
**Status**: ⬜ Not Started | **Effort**: Medium (M)

- [ ] Implement caching strategy
  - [ ] API response caching with TTL (already in place from Phase 4)
  - [ ] Static asset optimization (enable Next.js compression)
  - [ ] Image optimization with next/image (verify all images use it)
  - [ ] Verify pages load faster with caching

- [ ] Add error handling
  - [ ] Create `app/error.tsx` global error boundary
  - [ ] Create `app/not-found.tsx` 404 page
  - [ ] API error handling in all routes (try/catch, proper status codes)
  - [ ] Retry logic for API calls (exponential backoff)
  - [ ] User-friendly error messages (no stack traces)
  - [ ] Verify errors handled gracefully

- [ ] Add loading states
  - [ ] Skeleton loaders for widgets (using shadcn Skeleton)
  - [ ] Suspense boundaries for async components
  - [ ] Loading spinners for API calls
  - [ ] Loading page: `app/loading.tsx`
  - [ ] Verify loading states visible during fetches

- [ ] Performance testing
  - [ ] Run Lighthouse audit (target 90+ performance score)
  - [ ] Test on slow network (Chrome DevTools: Fast 3G)
  - [ ] Test with React DevTools Profiler (no unnecessary re-renders)
  - [ ] Memory leak testing (leave dashboard open for 1 hour)
  - [ ] Verify performance metrics acceptable

- [ ] Security hardening
  - [ ] Add Content Security Policy headers in `next.config.mjs`
  - [ ] Add rate limiting to API routes (simple in-memory or Redis)
  - [ ] Input validation and sanitization (Zod schemas for all inputs)
  - [ ] Verify API keys not exposed (check browser network tab)
  - [ ] Run `npm audit` and fix vulnerabilities
  - [ ] Verify no security warnings in console

**Deliverable**: Production-ready application

---

## Progress Tracking

### Overall Progress
- [ ] Phase 1: Foundation & Infrastructure (0/3 sections complete)
- [ ] Phase 2: Core Content Features (0/2 sections complete)
- [ ] Phase 3: Interactive Widgets (0/2 sections complete)
- [ ] Phase 4: API Integrations (0/4 sections complete)
- [ ] Phase 5: Docker Deployment (0/2 sections complete)

### Key Milestones
- [ ] **Milestone 1**: Project setup complete, can run dev server (End of Week 1)
- [ ] **Milestone 2**: Layout and navigation functional (End of Week 2)
- [ ] **Milestone 3**: Media library and quick links working (End of Week 3)
- [ ] **Milestone 4**: Mood tracker and task manager functional (End of Week 4)
- [ ] **Milestone 5**: Strava integration complete (End of Week 5)
- [ ] **Milestone 6**: Steam and Home Assistant integrations complete (End of Week 6)
- [ ] **Milestone 7**: Plex integration complete (End of Week 7)
- [ ] **Milestone 8**: Docker deployment ready, MVP complete (End of Week 8)

---

## Notes

### How to Use This Checklist
1. Work through tasks in order (dependencies are sequential)
2. Check off tasks as you complete them
3. Update "Status" for each section (Not Started → In Progress → Complete)
4. Add notes in subsections if needed
5. Update "Last Updated" date when making changes

### Task Status Key
- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked (specify reason)

### Priority Legend
- **P0**: Critical path, MVP blocker
- **P1**: High priority, included in MVP
- **P2**: Medium priority, nice to have
- **P3**: Low priority, post-MVP

---

**Document Version**: 1.0
**Last Updated**: 2025-11-10
**Status**: Ready to start
