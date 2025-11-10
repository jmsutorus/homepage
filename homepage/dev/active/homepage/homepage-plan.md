# Homepage Project - Implementation Plan

**Last Updated**: 2025-11-10

## Executive Summary

This plan outlines the development of a custom personal dashboard (homepage) that aggregates data from multiple services into a single, unified interface. The project aims to create an Obsidian-like experience for tracking daily moods, media consumption, exercise activities, gaming status, and smart home information.

**Key Objectives**:
- Build a self-hosted, customizable dashboard using Next.js 15 and shadcn/ui
- Implement Markdown-based content management for Obsidian compatibility
- Integrate with Strava, Steam, Plex, and Home Assistant APIs
- Provide mood tracking with year-in-pixels visualization
- Deploy via Docker for self-hosting flexibility

**Timeline**: 8 weeks to full-featured MVP
**Target Deployment**: Self-hosted Docker container
**Primary User**: Single user (developer)

---

## Current State Analysis

### Existing Assets
- **Research Documentation**: Comprehensive research completed on 25+ dashboard projects
  - File: `Research/comprehensive-research-findings.md`
  - Key findings: Next.js + shadcn/ui is optimal stack
  - API integration patterns documented

- **Initial Planning**: Basic feature requirements and tech stack identified
  - File: `Research/plan.md`
  - File: `Research/research-prd.md`

### Technology Landscape
Based on research, the optimal technology stack identified:
- **Framework**: Next.js 15 (App Router) with React 19
- **UI Components**: shadcn/ui (1251 code snippets, Trust Score: 10)
- **Styling**: Tailwind CSS
- **Database**: SQLite for structured data
- **Content**: Markdown files with frontmatter
- **Authentication**: NextAuth.js v5 for OAuth integrations

### Gap Analysis
Current gaps that need to be addressed:
1. No project infrastructure exists yet
2. API credentials not yet obtained (Strava, Steam, Plex, Home Assistant)
3. Design system and component architecture not defined
4. Docker deployment configuration not created
5. Database schema not designed

---

## Proposed Future State

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 15)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Dashboard Grid (Responsive Layout)                   │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │
│  │  │  Mood   │ │  Media  │ │ Exercise│ │  Steam  │  │  │
│  │  │ Tracker │ │  Cards  │ │  Stats  │ │ Status  │  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │
│  │  │  Tasks  │ │  Quick  │ │  Plex   │ │  Home   │  │  │
│  │  │ Manager │ │  Links  │ │ Status  │ │Assistant│  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼──────┐       ┌───────▼──────┐
        │   API Routes  │       │  File System │
        │   (Proxies)   │       │  (Markdown)  │
        └───────┬──────┘       └───────┬──────┘
                │                       │
        ┌───────▼──────┐       ┌───────▼──────┐
        │ External APIs │       │   SQLite DB  │
        │ (Strava, etc) │       │ (Moods/Tasks)│
        └──────────────┘       └──────────────┘
```

### Core Features

#### 1. Mood Tracker (Year in Pixels)
- Calendar heatmap showing entire year
- 1-5 mood rating system with color coding
- Click-to-add mood entries
- Optional daily journal notes
- SQLite storage for historical data

#### 2. Media Tracking
- Markdown-based content management
- Card grid display with images
- Frontmatter metadata (title, type, status, rating)
- Full notes/reviews viewable on click
- Obsidian-compatible file structure

#### 3. Exercise Tracking (Strava)
- OAuth 2.0 integration
- Recent runs display with stats
- Progress charts (distance, pace, elevation)
- Personal records tracking
- Weekly/monthly summaries

#### 4. Gaming Status (Steam)
- Currently playing game display
- Recent games with artwork
- Playtime statistics
- Friends online status (future)

#### 5. Plex Server Monitoring
- Server status (up/down)
- Currently streaming content
- Recently added media
- Integration via Tautulli API

#### 6. Home Assistant Integration
- Key sensor values display
- Device status monitoring
- Link to full HA dashboard
- Real-time updates via WebSocket

#### 7. Task Manager
- Add/complete tasks
- Due dates and times
- Priority levels
- SQLite storage
- Optional reminders (future)

#### 8. Quick Links
- Customizable bookmark cards
- Icon support
- Categories and organization
- JSON configuration

### User Experience
- **Responsive Design**: Mobile-first, adapts to all screen sizes
- **Theme Support**: Light/dark mode toggle with persistent preference
- **Fast Loading**: Static generation where possible, optimistic UI updates
- **Offline Capability**: Service worker for offline access (future)

---

## Implementation Phases

### Phase 1: Foundation & Infrastructure (Weeks 1-2)

#### 1.1 Project Setup
**Objective**: Initialize Next.js project with complete development environment

**Tasks**:
1. Initialize Next.js 15 project with TypeScript
   - Use `create-next-app@latest` with App Router
   - Enable TypeScript, ESLint, Tailwind CSS
   - Configure `tsconfig.json` for strict mode
   - **Acceptance Criteria**: `npm run dev` starts successfully

2. Install and configure shadcn/ui
   - Run `npx shadcn@latest init`
   - Install initial components: Button, Card, Dialog, Sheet, Tabs
   - Configure theme colors in `tailwind.config.ts`
   - **Acceptance Criteria**: Can import and use shadcn components

3. Set up project structure
   - Create directory structure: `app/`, `components/`, `lib/`, `content/`
   - Create `components/ui/` for shadcn components
   - Create `components/widgets/` for dashboard widgets
   - Create `lib/db/` for database utilities
   - Create `content/media/` for markdown files
   - **Acceptance Criteria**: All directories exist with README files

4. Configure environment variables
   - Create `.env.local` template
   - Set up `@t3-oss/env-nextjs` for type-safe env vars
   - Document required API keys in README
   - **Acceptance Criteria**: Environment validation works

5. Initialize Git repository and create .gitignore
   - Add `.env.local`, `node_modules/`, `.next/` to gitignore
   - Create initial commit
   - **Acceptance Criteria**: Clean git status, no secrets committed

**Effort**: Medium (M)
**Dependencies**: None
**Deliverable**: Runnable Next.js project with shadcn/ui configured

---

#### 1.2 Database Setup
**Objective**: Configure SQLite database with schema for structured data

**Tasks**:
1. Install database dependencies
   - `npm install better-sqlite3`
   - `npm install -D @types/better-sqlite3`
   - **Acceptance Criteria**: Packages installed successfully

2. Create database schema
   - Design tables: `mood_entries`, `tasks`, `api_cache`
   - Write migration scripts in `lib/db/schema.sql`
   - **Schema**:
     ```sql
     CREATE TABLE mood_entries (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       date TEXT UNIQUE NOT NULL,
       rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
       note TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );

     CREATE TABLE tasks (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       title TEXT NOT NULL,
       completed BOOLEAN DEFAULT 0,
       due_date TEXT,
       priority TEXT CHECK(priority IN ('low', 'medium', 'high')),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );

     CREATE TABLE api_cache (
       key TEXT PRIMARY KEY,
       value TEXT NOT NULL,
       expires_at TIMESTAMP NOT NULL
     );
     ```
   - **Acceptance Criteria**: Schema file created with all tables

3. Create database utility functions
   - `lib/db/index.ts`: Database connection singleton
   - `lib/db/mood.ts`: Mood CRUD operations
   - `lib/db/tasks.ts`: Task CRUD operations
   - **Acceptance Criteria**: Can query database from code

4. Seed database with sample data
   - Create `lib/db/seed.ts` script
   - Add sample mood entries and tasks
   - **Acceptance Criteria**: `npm run db:seed` populates database

**Effort**: Medium (M)
**Dependencies**: Project setup complete
**Deliverable**: Working SQLite database with CRUD operations

---

#### 1.3 Layout & Navigation
**Objective**: Build responsive dashboard layout with navigation

**Tasks**:
1. Create root layout (`app/layout.tsx`)
   - Set up HTML structure with metadata
   - Configure fonts (Inter, Fira Code)
   - Include theme provider for dark mode
   - **Acceptance Criteria**: Basic HTML renders with fonts

2. Build header component
   - Logo/branding area
   - Theme toggle button
   - Navigation links (Desktop)
   - Hamburger menu (Mobile)
   - **Acceptance Criteria**: Header responsive on all screen sizes

3. Implement theme switcher
   - Install `next-themes`
   - Create theme toggle component
   - Persist theme selection to localStorage
   - Support system preference detection
   - **Acceptance Criteria**: Theme switches between light/dark modes

4. Create dashboard grid layout
   - Responsive 12-column grid using Tailwind
   - Breakpoints: mobile (1 col), tablet (2 col), desktop (3-4 col)
   - Widget placeholder cards
   - **Acceptance Criteria**: Grid adapts to screen sizes

5. Add navigation structure
   - Create `app/(dashboard)/layout.tsx` for dashboard routes
   - Sidebar navigation component
   - Route structure: `/`, `/mood`, `/media`, `/tasks`
   - **Acceptance Criteria**: Can navigate between pages

**Effort**: Large (L)
**Dependencies**: Project setup complete
**Deliverable**: Responsive dashboard layout with navigation

---

### Phase 2: Core Content Features (Weeks 3-4)

#### 2.1 Markdown-Based Media Tracking
**Objective**: Implement Obsidian-compatible media library

**Tasks**:
1. Set up Markdown processing
   - Install `gray-matter`, `next-mdx-remote`
   - Create `lib/mdx.ts` utilities for reading Markdown files
   - Implement frontmatter parsing
   - **Acceptance Criteria**: Can read and parse Markdown files

2. Create sample media content
   - Add 5-10 sample `.md` files in `content/media/movies/`
   - Add 5-10 sample `.md` files in `content/media/tv/`
   - Include frontmatter: title, type, status, rating, imageUrl
   - Add sample poster images to `public/images/media/`
   - **Acceptance Criteria**: Content files exist with valid frontmatter

3. Build media card component
   - shadcn/ui Card component base
   - Display poster image, title, rating
   - Status badge (watching, completed, planned)
   - Hover effects and animations
   - **Acceptance Criteria**: Card displays media metadata correctly

4. Create media grid page
   - Load all Markdown files at build time
   - Display in responsive grid (2-4 columns)
   - Filter by type (movies, TV, books)
   - Search functionality
   - **Acceptance Criteria**: `/media` page shows all media items

5. Implement media detail view
   - Click card to open modal/sheet
   - Display full Markdown content (notes/review)
   - Show all metadata
   - Edit link (opens in VSCode/Obsidian)
   - **Acceptance Criteria**: Can view full media details

**Effort**: Large (L)
**Dependencies**: Layout complete
**Deliverable**: Functional media library with Markdown support

---

#### 2.2 Quick Links Widget
**Objective**: Create customizable bookmark manager

**Tasks**:
1. Design links configuration format
   - Create `config/links.json` with structure:
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
   - **Acceptance Criteria**: JSON schema documented

2. Build link card component
   - Compact card design with icon and title
   - Click to open link in new tab
   - Hover effects
   - Support for custom icons (FontAwesome/Lucide)
   - **Acceptance Criteria**: Link card displays correctly

3. Create quick links widget
   - Read from `links.json`
   - Display in category groups
   - Responsive grid layout
   - **Acceptance Criteria**: Widget shows all links from config

4. Add links to dashboard
   - Place widget on main dashboard page
   - Position in grid layout
   - **Acceptance Criteria**: Links accessible from homepage

**Effort**: Small (S)
**Dependencies**: Layout complete
**Deliverable**: Functional quick links widget

---

### Phase 3: Interactive Widgets (Weeks 3-4)

#### 3.1 Mood Tracker (Year in Pixels)
**Objective**: Build interactive mood tracking with calendar heatmap

**Tasks**:
1. Install visualization library
   - `npm install @uiw/react-heat-map`
   - Test component renders correctly
   - **Acceptance Criteria**: Library installed and importable

2. Create mood entry component
   - Mood selector (1-5 rating or emoji picker)
   - Optional note textarea
   - Date picker for backfilling
   - Save button with validation
   - **Acceptance Criteria**: Can select mood and save

3. Build mood heatmap component
   - Use @uiw/react-heat-map with custom colors
   - Load data from SQLite database
   - Click day to open entry modal
   - Tooltip showing mood and note on hover
   - **Acceptance Criteria**: Heatmap displays year of mood data

4. Create API routes for mood data
   - `POST /api/mood` - Create/update mood entry
   - `GET /api/mood?date=YYYY-MM-DD` - Get specific entry
   - `GET /api/mood?range=year` - Get year of data
   - **Acceptance Criteria**: API routes work with database

5. Add mood tracker to dashboard
   - Create dedicated page at `/mood`
   - Add widget to main dashboard
   - Show current month preview on dashboard
   - **Acceptance Criteria**: Mood tracker fully functional

**Effort**: Extra Large (XL)
**Dependencies**: Database setup complete
**Deliverable**: Fully functional mood tracker with year view

---

#### 3.2 Task Manager
**Objective**: Build simple task management system

**Tasks**:
1. Create task form component
   - Input field for task title
   - Optional due date/time picker
   - Priority selector (low, medium, high)
   - Add button with keyboard shortcut (Ctrl+Enter)
   - **Acceptance Criteria**: Can create new tasks

2. Build task list component
   - Display all tasks from database
   - Checkbox to mark complete
   - Delete button
   - Edit in-place functionality
   - Filter: all, active, completed
   - **Acceptance Criteria**: Task list displays and updates

3. Add task sorting and filtering
   - Sort by: due date, priority, created date
   - Filter by: status, priority
   - Search functionality
   - **Acceptance Criteria**: Can sort and filter tasks

4. Create API routes for tasks
   - `POST /api/tasks` - Create task
   - `PATCH /api/tasks/:id` - Update task
   - `DELETE /api/tasks/:id` - Delete task
   - `GET /api/tasks` - Get all tasks
   - **Acceptance Criteria**: API CRUD operations work

5. Add tasks to dashboard
   - Create dedicated page at `/tasks`
   - Add widget to main dashboard (shows top 5 tasks)
   - **Acceptance Criteria**: Tasks accessible and functional

**Effort**: Large (L)
**Dependencies**: Database setup complete
**Deliverable**: Functional task manager

---

### Phase 4: API Integrations (Weeks 5-7)

#### 4.1 Strava Exercise Tracking (Priority 1)
**Objective**: Integrate Strava API for exercise tracking

**Tasks**:
1. Register Strava API application
   - Go to https://www.strava.com/settings/api
   - Create new application
   - Note Client ID and Client Secret
   - Set callback URL: `http://localhost:3000/api/auth/callback/strava`
   - **Acceptance Criteria**: Strava app registered, credentials obtained

2. Set up NextAuth.js with Strava provider
   - Install `next-auth@beta` (v5)
   - Create `app/api/auth/[...nextauth]/route.ts`
   - Configure Strava OAuth provider
   - Set up JWT session strategy
   - **Acceptance Criteria**: OAuth flow works, can login with Strava

3. Create Strava API client
   - `lib/api/strava.ts` with fetch wrappers
   - Token refresh logic
   - Error handling and rate limiting
   - **Functions**: `getAthleteActivities()`, `getActivityDetails()`
   - **Acceptance Criteria**: Can fetch activities from Strava

4. Build exercise stats widget
   - Display recent runs (last 7 days)
   - Stats cards: total distance, average pace, elevation
   - "This Week" summary
   - Link to full activity on Strava
   - **Acceptance Criteria**: Widget displays recent exercise data

5. Create exercise charts
   - Install `recharts`
   - Line chart: distance over time (last 30 days)
   - Bar chart: weekly distance comparison
   - Personal records display
   - **Acceptance Criteria**: Charts display Strava data

6. Add exercise widget to dashboard
   - Place on main dashboard
   - Create dedicated page at `/exercise`
   - Cache API responses (15-minute TTL)
   - **Acceptance Criteria**: Exercise data visible on dashboard

**Effort**: Extra Large (XL)
**Dependencies**: Layout complete, NextAuth setup
**Deliverable**: Functional Strava integration with charts

---

#### 4.2 Steam Gaming Status (Priority 2)
**Objective**: Display Steam gaming activity

**Tasks**:
1. Register Steam API key
   - Go to https://steamcommunity.com/dev
   - Register for API key (requires Steam account)
   - Note API key and Steam ID
   - **Acceptance Criteria**: API key obtained

2. Create Steam API client
   - `lib/api/steam.ts` with fetch wrappers
   - **Functions**:
     - `getPlayerSummary(steamId)` - User profile and online status
     - `getRecentlyPlayedGames(steamId)` - Recent games
     - `getOwnedGames(steamId)` - Full library
   - **Acceptance Criteria**: Can fetch Steam data

3. Create API route for Steam data
   - `GET /api/steam/status` - Current player status
   - `GET /api/steam/recent` - Recently played games
   - Proxy requests to keep API key server-side
   - Cache responses (5-minute TTL)
   - **Acceptance Criteria**: API routes return Steam data

4. Build Steam status widget
   - Display currently playing game (if online)
   - Show game artwork
   - Recent games list with playtime
   - Online status indicator
   - **Acceptance Criteria**: Widget displays Steam status

5. Add Steam widget to dashboard
   - Place on main dashboard
   - Show compact view (expand for details)
   - **Acceptance Criteria**: Steam status visible on dashboard

**Effort**: Medium (M)
**Dependencies**: Layout complete
**Deliverable**: Functional Steam integration

---

#### 4.3 Home Assistant Integration (Priority 3)
**Objective**: Display smart home sensor data

**Tasks**:
1. Set up Home Assistant access
   - Generate Long-Lived Access Token from HA profile
   - Note Home Assistant URL (e.g., `http://homeassistant.local:8123`)
   - Document accessible entities (sensors, switches, etc.)
   - **Acceptance Criteria**: Can access HA API with token

2. Create Home Assistant API client
   - `lib/api/homeassistant.ts` with fetch wrappers
   - **Functions**:
     - `getStates()` - Get all entity states
     - `getState(entityId)` - Get specific entity
     - `callService(domain, service, data)` - Control devices
   - **Acceptance Criteria**: Can fetch HA data

3. Create API routes for Home Assistant
   - `GET /api/homeassistant/sensors` - Get sensor values
   - `GET /api/homeassistant/state/:entityId` - Get entity state
   - Cache responses (1-minute TTL)
   - **Acceptance Criteria**: API routes return HA data

4. Build Home Assistant widget
   - Display key sensor values (temperature, humidity, etc.)
   - Configurable entity list in `config/homeassistant.json`
   - Status indicators (green/red for binary sensors)
   - Link to full HA dashboard
   - **Acceptance Criteria**: Widget displays HA sensors

5. Add Home Assistant widget to dashboard
   - Place on main dashboard
   - Real-time updates (WebSocket connection - future)
   - **Acceptance Criteria**: HA data visible on dashboard

**Effort**: Large (L)
**Dependencies**: Layout complete
**Deliverable**: Functional Home Assistant integration

---

#### 4.4 Plex Server Monitoring
**Objective**: Display Plex server status via Tautulli

**Tasks**:
1. Set up Tautulli access
   - Install Tautulli (if not already running)
   - Enable API in Tautulli settings
   - Note API key and Tautulli URL
   - **Acceptance Criteria**: Can access Tautulli API

2. Create Tautulli API client
   - `lib/api/tautulli.ts` with fetch wrappers
   - **Functions**:
     - `getActivity()` - Current streams
     - `getLibraries()` - Library stats
     - `getRecentlyAdded()` - New media
     - `getHomeStats()` - Top content
   - **Acceptance Criteria**: Can fetch Tautulli data

3. Create API routes for Plex/Tautulli
   - `GET /api/plex/activity` - Current streams
   - `GET /api/plex/recent` - Recently added media
   - `GET /api/plex/stats` - Server stats
   - Cache responses (2-minute TTL)
   - **Acceptance Criteria**: API routes return Plex data

4. Build Plex status widget
   - Server online/offline indicator
   - Currently streaming content (if any)
   - Recently added media with posters
   - Library size stats
   - **Acceptance Criteria**: Widget displays Plex status

5. Add Plex widget to dashboard
   - Place on main dashboard
   - Link to Tautulli or Plex web interface
   - **Acceptance Criteria**: Plex status visible on dashboard

**Effort**: Large (L)
**Dependencies**: Layout complete, Tautulli installed
**Deliverable**: Functional Plex server monitoring

---

### Phase 5: Docker Deployment (Week 8)

#### 5.1 Docker Configuration
**Objective**: Create Docker container for self-hosting

**Tasks**:
1. Create Dockerfile
   - Multi-stage build (builder + runner)
   - Use Node 20 Alpine base image
   - Copy dependencies and build files
   - Optimize for production
   - **Acceptance Criteria**: Docker image builds successfully

2. Create docker-compose.yml
   - Define homepage service
   - Mount volumes for database and content
   - Environment variable configuration
   - Port mapping (3000:3000)
   - **Acceptance Criteria**: `docker-compose up` starts container

3. Create .dockerignore
   - Exclude `node_modules/`, `.next/`, `.git/`
   - Optimize build context size
   - **Acceptance Criteria**: Docker build is fast and efficient

4. Document Docker deployment
   - Update README with Docker instructions
   - Environment variable documentation
   - Volume mount documentation
   - **Acceptance Criteria**: Can deploy following README

5. Test Docker deployment
   - Build image: `docker build -t homepage .`
   - Run container: `docker-compose up -d`
   - Verify all features work in container
   - Test persistence (database, content)
   - **Acceptance Criteria**: All features work in Docker

**Effort**: Medium (M)
**Dependencies**: All features complete
**Deliverable**: Docker container ready for self-hosting

---

#### 5.2 Production Optimization
**Objective**: Optimize performance for production

**Tasks**:
1. Implement caching strategy
   - API response caching with TTL
   - Static asset optimization
   - Image optimization with Next.js Image
   - **Acceptance Criteria**: Pages load faster

2. Add error handling
   - Global error boundary
   - API error handling and retry logic
   - User-friendly error messages
   - **Acceptance Criteria**: Errors handled gracefully

3. Add loading states
   - Skeleton loaders for widgets
   - Suspense boundaries for async components
   - Loading spinners for API calls
   - **Acceptance Criteria**: Loading states visible during fetches

4. Performance testing
   - Lighthouse audit (target 90+ score)
   - Test on slow network (3G simulation)
   - Memory leak testing
   - **Acceptance Criteria**: Performance metrics acceptable

5. Security hardening
   - Content Security Policy headers
   - API rate limiting
   - Input validation and sanitization
   - **Acceptance Criteria**: No security warnings

**Effort**: Medium (M)
**Dependencies**: Docker deployment complete
**Deliverable**: Production-ready application

---

## Risk Assessment and Mitigation Strategies

### Technical Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|---------------------|
| API rate limits exceeded | High | Medium | Implement aggressive caching (15-30 min TTL), cache in SQLite, show cached data first |
| Strava OAuth flow complexity | Medium | Medium | Use NextAuth.js (battle-tested), follow official docs carefully, test thoroughly |
| SQLite file corruption | High | Low | Regular automated backups, implement write-ahead logging, use transactions |
| Docker deployment issues | Medium | Low | Test locally before production, use multi-stage builds, document all steps |
| Markdown parsing errors | Low | Low | Validate frontmatter schema, graceful error handling, test with edge cases |
| Home Assistant connectivity | Medium | Medium | Handle offline state gracefully, cache last known values, show "offline" badge |

### Project Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|---------------------|
| Timeline overruns | Medium | Medium | Prioritize Phase 1-3 features, defer Phase 4 integrations if needed |
| Scope creep | Medium | High | Stick to MVP features first, maintain "future enhancements" backlog |
| Learning curve (new tech) | Low | Low | shadcn/ui and Next.js well-documented, leverage MCP tools for help |
| API credential delays | Low | Medium | Register for all APIs early (Week 1), document any delays |

### Operational Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|---------------------|
| Server downtime | Medium | Low | Self-hosted = full control, implement health checks, alerting |
| Data loss | High | Low | Regular backups of SQLite and Markdown files, version control for content |
| Breaking API changes | Medium | Low | Pin dependency versions, monitor API changelogs, implement versioning |

---

## Success Metrics

### Development Phase Metrics
- [ ] All Phase 1-3 features complete by Week 4
- [ ] All API integrations (Strava, Steam, HA, Plex) working by Week 7
- [ ] Docker deployment functional by Week 8
- [ ] Zero security vulnerabilities in dependencies
- [ ] Lighthouse performance score 90+

### User Experience Metrics
- [ ] Dashboard loads in <2 seconds on fast connection
- [ ] Mobile responsive on all screen sizes (320px+)
- [ ] Theme switcher works without flicker
- [ ] All API widgets show data within 5 seconds

### Feature Completeness
- [ ] Mood tracker: Can view year heatmap, add entries, view notes
- [ ] Media library: Can view all media, read reviews, filter by type
- [ ] Exercise tracking: Shows recent runs, charts, personal records
- [ ] Steam status: Shows currently playing game, recent activity
- [ ] Plex status: Shows server status, current streams
- [ ] Home Assistant: Shows sensor values, online status
- [ ] Tasks: Can add, complete, filter, sort tasks
- [ ] Quick links: Displays all configured bookmarks

---

## Required Resources and Dependencies

### Development Tools
- Node.js 20+ (LTS)
- npm or pnpm package manager
- VSCode or preferred editor
- Git for version control
- Docker Desktop for local testing

### External Services & APIs
- **Strava**: Developer account, OAuth app registration (free)
- **Steam**: API key (free, requires Steam account)
- **Home Assistant**: Long-Lived Access Token (self-hosted instance)
- **Plex/Tautulli**: Tautulli installation, API key (self-hosted)

### Infrastructure
- Self-hosted server (Raspberry Pi, VPS, or home server)
- Docker and Docker Compose installed
- Reverse proxy with SSL (Traefik, Nginx Proxy Manager) - recommended
- Domain name (optional, for HTTPS)

### MCP Tools Available
- **context7**: Query up-to-date documentation for packages
- **shadcn MCP**: Browse and add UI components
- **next-devtools MCP**: Next.js development assistance

---

## Timeline Estimates

### Week-by-Week Breakdown

**Week 1**: Foundation
- Days 1-2: Project setup, shadcn/ui installation, directory structure
- Days 3-4: Database setup, schema creation, seed data
- Days 5-7: Layout, navigation, theme switcher

**Week 2**: Content Features
- Days 1-3: Markdown media tracking, card components, grid layout
- Days 4-5: Quick links widget, JSON configuration
- Days 6-7: Testing, bug fixes, responsive design tweaks

**Week 3**: Interactive Widgets (Part 1)
- Days 1-3: Mood tracker heatmap, entry modal, database integration
- Days 4-5: Mood API routes, dashboard integration
- Days 6-7: Mood tracker polish, edge case testing

**Week 4**: Interactive Widgets (Part 2)
- Days 1-3: Task manager UI, form, list component
- Days 4-5: Task API routes, filtering, sorting
- Days 6-7: Task manager polish, dashboard integration

**Week 5**: API Integration - Strava
- Days 1-2: Strava app registration, NextAuth setup
- Days 3-4: Strava API client, token management
- Days 5-6: Exercise stats widget, charts
- Day 7: Testing, error handling

**Week 6**: API Integration - Steam & Home Assistant
- Days 1-2: Steam API key, client, widget
- Days 3-5: Home Assistant token, client, widget, sensor configuration
- Days 6-7: Testing both integrations

**Week 7**: API Integration - Plex
- Days 1-2: Tautulli setup, API client
- Days 3-4: Plex status widget, activity display
- Days 5-7: Testing all API integrations, error handling

**Week 8**: Docker & Production
- Days 1-2: Dockerfile, docker-compose, testing
- Days 3-4: Performance optimization, caching
- Days 5-6: Security hardening, error handling
- Day 7: Final testing, documentation, deployment

### Critical Path
1. Project setup → Database → Layout (no parallelization)
2. Media tracking and Quick links (can be parallel)
3. Mood tracker → Task manager (depends on database)
4. All API integrations can be done in parallel (but prioritize Strava)
5. Docker deployment depends on all features complete

---

## Future Enhancements (Post-MVP)

These features are deferred to future iterations:

### Phase 6: Advanced Features (Post-Week 8)
1. **Drag-and-Drop Dashboard Customization**
   - Implement react-grid-layout
   - Persistent layout storage per user
   - Resize widgets

2. **Obsidian-Style Wiki Links**
   - Parse [[Link]] syntax in Markdown
   - Automatic bidirectional links
   - Backlinks panel

3. **Advanced Exercise Analytics**
   - Running pace zones
   - Training load tracking
   - Goal setting and progress

4. **Task Reminders & Notifications**
   - Browser notifications
   - Email reminders (optional)
   - Recurring tasks

5. **Real-Time Updates**
   - WebSocket connections for HA
   - Live Plex stream updates
   - Push notifications for events

6. **Multi-User Support**
   - User authentication
   - Per-user dashboards
   - Shared widgets (optional)

7. **Mobile App (PWA)**
   - Progressive Web App manifest
   - Offline mode with service worker
   - Install prompt

8. **Data Export & Backup**
   - Export all data to JSON/CSV
   - Automated backup to cloud storage
   - Import from other services

---

## Conclusion

This implementation plan provides a clear roadmap for building a custom personal dashboard over 8 weeks. The phased approach ensures steady progress with working features at each milestone. The focus on API integrations (Strava, Steam, Home Assistant, Plex) aligns with your priorities, while the Markdown-based content management provides the Obsidian-like experience you're looking for.

**Key Success Factors**:
- Start with solid foundation (Phase 1-2)
- Build interactive features early to maintain momentum (Phase 3)
- Prioritize high-value API integrations (Phase 4)
- Deploy early with Docker for testing (Phase 5)

**Next Steps**:
1. Review this plan and adjust timelines if needed
2. Begin Phase 1: Project setup (create Next.js project)
3. Register for API credentials (Strava, Steam) early
4. Start building!

---

**Document Version**: 1.0
**Last Updated**: 2025-11-10
**Status**: Ready for implementation
