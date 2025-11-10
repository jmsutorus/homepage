# Homepage Project - Context & Key Decisions

**Last Updated**: 2025-11-10

## Project Overview

This document captures the architectural decisions, technology choices, and critical context for the Homepage project. It serves as a reference for understanding why certain choices were made and what constraints exist.

---

## Project Goals

### Primary Objective
Build a self-hosted personal dashboard that aggregates data from multiple services into a unified, Obsidian-like interface for tracking daily activities, mood, media consumption, exercise, and smart home status.

### Key Requirements
1. **Obsidian-Like Experience**: Markdown-based content management with frontmatter
2. **Multi-Service Integration**: Strava, Steam, Plex, Home Assistant APIs
3. **Mood Tracking**: Year-in-pixels calendar heatmap with historical data
4. **Self-Hosted**: Docker deployment for full control and privacy
5. **Single User**: No multi-user complexity in MVP
6. **Mobile Responsive**: Works on all devices (320px+)

### Non-Goals (Out of Scope for MVP)
- Multi-user authentication and profiles
- Real-time WebSocket updates (future enhancement)
- Mobile native app (PWA later)
- Drag-and-drop widget customization (future)
- Integration with additional services beyond the 4 priorities

---

## Architecture Decisions

### Technology Stack

#### Frontend Framework: Next.js 15 (App Router)
**Decision**: Use Next.js 15 with App Router instead of Pages Router or other frameworks

**Rationale**:
- **Server Components**: Reduce client-side JavaScript, improve performance
- **Static Generation**: Pre-render pages at build time for fast loads
- **API Routes**: Built-in backend for API proxying (keeps keys secure)
- **React 19**: Latest features (Suspense, Server Actions, etc.)
- **File-Based Routing**: Intuitive structure for pages
- **Image Optimization**: Built-in next/image component
- **TypeScript Support**: First-class TypeScript integration

**Alternatives Considered**:
- **Vue.js/Nuxt**: Good option, but React ecosystem larger, shadcn/ui only supports React
- **SvelteKit**: Excellent performance, but smaller ecosystem
- **Remix**: Similar to Next.js, but less mature, fewer resources

**Research Reference**:
- Homepage (20K stars), Homarr (6K stars) both use Next.js
- shadcn/ui (Trust Score: 10) is React-based

---

#### UI Components: shadcn/ui + Tailwind CSS
**Decision**: Use shadcn/ui for component library instead of Material-UI, Chakra, or others

**Rationale**:
- **Copy-Paste Approach**: Components live in your codebase, fully customizable
- **Radix UI Primitives**: Accessible, unstyled components as foundation
- **Tailwind CSS**: Utility-first styling, minimal CSS bundle
- **TypeScript-First**: Full type safety out of the box
- **No Bundle Bloat**: Only include components you use
- **Theme System**: CSS variables for easy theming
- **Trust Score 10**: Most reliable and up-to-date (Context7 MCP data)

**Alternatives Considered**:
- **Material-UI**: Too heavy, opinionated styling, hard to customize
- **Chakra UI**: Good, but more bundle size than shadcn/ui
- **Ant Design**: Enterprise-focused, overkill for personal project

**Research Reference**:
- 1251 code snippets available in Context7 MCP
- Used by modern dashboard templates (next-shadcn-dashboard-starter)

---

#### Database: SQLite (better-sqlite3)
**Decision**: Use SQLite for structured data instead of PostgreSQL, MongoDB, or file-based storage

**Rationale**:
- **Serverless**: No separate database server needed
- **Single File**: Easy backups, portable
- **Fast Reads**: Excellent performance for single-user scenario
- **Embedded**: Runs in Node.js process (better-sqlite3)
- **SQL Standard**: Familiar query language
- **Transactions**: ACID compliance for data integrity
- **Perfect for MVP**: Simple, no infrastructure overhead

**Alternatives Considered**:
- **PostgreSQL**: Overkill for single user, requires separate server
- **MongoDB**: Document-based, but structured data fits SQL better
- **JSON Files**: No queries, no transactions, manual file locking

**Use Cases**:
- `mood_entries` table: Historical mood tracking data
- `tasks` table: Task manager with due dates and priorities
- `api_cache` table: Cache external API responses to respect rate limits

**Why NOT SQLite**:
- Content/media tracking: Using Markdown files instead (Obsidian-compatible)
- Configuration: Using JSON files (version control friendly)

---

#### Content Management: Markdown Files with Frontmatter
**Decision**: Use Markdown files with frontmatter for media tracking instead of database storage

**Rationale**:
- **Obsidian Compatibility**: Can edit files directly in Obsidian
- **Version Control**: Git-friendly, track changes over time
- **Portable**: Plain text files, no vendor lock-in
- **Rich Content**: Full Markdown support for reviews/notes
- **Frontmatter**: Structured metadata (title, rating, status)
- **Easy Editing**: Any text editor works

**Libraries**:
- `gray-matter`: Parse frontmatter from Markdown
- `next-mdx-remote`: Render MDX content with React components

**File Structure**:
```
content/
├── media/
│   ├── movies/
│   │   ├── the-matrix.md
│   │   └── inception.md
│   ├── tv/
│   │   ├── breaking-bad.md
│   │   └── the-office.md
│   └── books/
│       └── project-hail-mary.md
└── journal/
    └── 2025-11-10.md
```

**Frontmatter Schema**:
```yaml
---
title: "The Matrix"
type: "movie"
status: "watched"
rating: 5
imageUrl: "/images/media/the-matrix.jpg"
dateWatched: "2024-11-01"
genres: ["sci-fi", "action"]
---
```

**Alternatives Considered**:
- **Database Storage**: Less portable, harder to edit, no Obsidian compatibility
- **CMS (Contentful, Sanity)**: Overkill, introduces external dependency

---

#### Authentication: NextAuth.js v5 (Auth.js)
**Decision**: Use NextAuth.js for OAuth integrations with external APIs

**Rationale**:
- **OAuth 2.0**: Needed for Strava API access
- **Provider Support**: Built-in Strava, Google, GitHub providers
- **Session Management**: JWT or database sessions
- **Security**: Industry best practices, actively maintained
- **Next.js Integration**: Designed specifically for Next.js

**Use Cases**:
- Strava OAuth: Required for accessing user's exercise data
- Future: GitHub OAuth for social features (if added)

**Single-User Consideration**:
- MVP does not require user authentication to access dashboard
- Auth only needed for OAuth flows with external services
- Can deploy behind VPN or reverse proxy for access control

**Alternatives Considered**:
- **Clerk**: Modern, beautiful UI, but paid service for features
- **Manual OAuth**: Reinvent the wheel, error-prone
- **No Auth**: Can't access Strava API without OAuth

---

### Data Flow Architecture

#### API Proxy Pattern
**Decision**: All external API calls go through Next.js API routes (server-side)

**Rationale**:
- **Security**: API keys never exposed to client
- **Rate Limiting**: Centralized control over request frequency
- **Caching**: Implement response caching to reduce API calls
- **Error Handling**: Consistent error responses
- **CORS**: No CORS issues when proxying

**Pattern**:
```
Client Component → /api/steam/status → Steam API
                ↑ (browser)         ↑ (server-side)
                                    ↓
                                SQLite Cache
```

**Example Flow** (Steam Widget):
1. Client component calls `/api/steam/status`
2. API route checks SQLite cache (5-minute TTL)
3. If cache miss, fetch from Steam API
4. Store response in cache, return to client
5. Client renders widget with data

**Alternatives Considered**:
- **Client-Side API Calls**: Exposes API keys, CORS issues, no caching
- **BFF (Backend for Frontend)**: Separate service, added complexity

---

#### Caching Strategy
**Decision**: Implement multi-layer caching with TTL (Time To Live)

**Cache Layers**:
1. **API Response Cache** (SQLite `api_cache` table)
   - Cache external API responses
   - TTL varies by API:
     - Strava activities: 15 minutes
     - Steam status: 5 minutes
     - Home Assistant sensors: 1 minute
     - Plex streams: 2 minutes
   - Key: `{api}:{endpoint}:{params hash}`

2. **Next.js Static Generation** (Build Time)
   - Media library pages (Markdown content)
   - Quick links (JSON config)
   - Static pages that don't change frequently

3. **Client-Side Cache** (React Query / TanStack Query)
   - In-memory cache for API responses
   - Stale-while-revalidate pattern
   - Optimistic UI updates

**Rationale**:
- **Respect Rate Limits**: Avoid hitting API limits (Strava: 100/15min)
- **Performance**: Faster loads, less network traffic
- **Offline Resilience**: Show stale data if API unavailable
- **Cost Savings**: Fewer API calls (if using paid APIs)

---

### Deployment Architecture

#### Docker Containerization
**Decision**: Deploy as Docker container for self-hosting

**Rationale**:
- **Self-Hosted Requirement**: User wants full control, no cloud vendor
- **Portability**: Run on any Docker-compatible host (Raspberry Pi, VPS, home server)
- **Isolation**: Contained environment, no conflicts with other apps
- **Easy Updates**: Pull new image, restart container
- **Volume Mounts**: Persist database and content outside container

**Dockerfile Strategy**:
- Multi-stage build: `builder` → `runner`
- Node 20 Alpine base image (minimal size)
- Production build with optimizations
- Health check endpoint

**docker-compose.yml**:
```yaml
services:
  homepage:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data           # SQLite database
      - ./content:/app/content     # Markdown files
    env_file:
      - .env
    restart: unless-stopped
```

**Alternatives Considered**:
- **Vercel Deployment**: Easiest for Next.js, but not self-hosted
- **VPS (bare metal)**: Less isolated, harder to manage dependencies
- **Kubernetes**: Overkill for single-app deployment

---

## Key Technical Decisions

### State Management
**Decision**: Use Zustand for lightweight global state, TanStack Query for API data

**Rationale**:
- **Zustand**: Minimal boilerplate, TypeScript-friendly, no context hell
- **TanStack Query**: Best-in-class data fetching, caching, synchronization
- **No Redux**: Too much boilerplate for small project

**Use Cases**:
- Zustand: Theme preference, layout state, user preferences
- TanStack Query: API data, cache management, refetch logic

---

### Form Validation
**Decision**: Use Zod for schema validation

**Rationale**:
- **TypeScript Integration**: Infer types from schemas
- **Runtime Validation**: Validate API responses and form inputs
- **Error Messages**: Clear, customizable error messages
- **React Hook Form**: Works seamlessly with react-hook-form

---

### Date/Time Handling
**Decision**: Use date-fns for date manipulation

**Rationale**:
- **Modular**: Import only functions you need (tree-shakeable)
- **TypeScript**: Full type definitions
- **Functional**: Immutable, pure functions
- **Lightweight**: Smaller than moment.js

**Alternatives Considered**:
- **Day.js**: Similar size, but date-fns more popular
- **Moment.js**: Deprecated, too heavy

---

### Visualization Libraries
**Decision**:
- **@uiw/react-heat-map** for mood tracking calendar
- **Recharts** for exercise charts

**Rationale**:
- **@uiw/react-heat-map**:
  - GitHub-style heatmap, perfect for year-in-pixels
  - 27K downloads/week, actively maintained
  - Customizable colors, click events
- **Recharts**:
  - Composable chart library
  - Built on D3.js, but simpler API
  - Responsive, accessible
  - Line charts (distance over time), bar charts (weekly comparison)

**Alternatives Considered**:
- **Chart.js**: More imperative API, less React-friendly
- **Victory**: Similar to Recharts, but larger bundle
- **D3.js**: Too low-level, steep learning curve

---

## API Integration Details

### Strava API
**Authentication**: OAuth 2.0
**Rate Limits**: 100 requests per 15 minutes, 1000 per day
**Key Endpoints**:
- `GET /athlete/activities`: List activities
- `GET /activities/:id`: Activity details

**Token Management**:
- Access token expires after 6 hours
- Refresh token for long-lived access
- Store tokens in NextAuth session

**Caching**: 15-minute TTL (recent activities change infrequently)

**Error Handling**:
- Rate limit exceeded: Show cached data, retry after delay
- Token expired: Refresh token automatically
- API down: Show "Strava unavailable" message

---

### Steam Web API
**Authentication**: API Key (no OAuth)
**Rate Limits**: None documented (but respect fair use)
**Key Endpoints**:
- `GetPlayerSummaries`: User profile, online status, currently playing
- `GetRecentlyPlayedGames`: Recent games with playtime

**Caching**: 5-minute TTL (game status changes frequently)

**Error Handling**:
- Invalid Steam ID: Show config error
- API down: Show cached data
- Private profile: Show "Profile is private" message

---

### Home Assistant REST API
**Authentication**: Long-Lived Access Token
**Rate Limits**: None (self-hosted)
**Key Endpoints**:
- `GET /api/states`: All entity states
- `GET /api/states/:entity_id`: Specific entity
- `POST /api/services/:domain/:service`: Call service

**Caching**: 1-minute TTL (sensors update frequently)

**Error Handling**:
- HA offline: Show "Home Assistant offline" with last known values
- Invalid entity ID: Skip display, log error
- Network error: Retry with exponential backoff

**Future Enhancement**: WebSocket API for real-time updates

---

### Tautulli API (Plex)
**Authentication**: API Key
**Rate Limits**: None documented
**Key Endpoints**:
- `get_activity`: Current streams
- `get_recently_added`: New media
- `get_libraries`: Library stats

**Caching**: 2-minute TTL (stream status changes moderately)

**Error Handling**:
- Tautulli down: Show cached data, "Unable to connect" message
- Plex server offline: Show "Plex server offline"
- No activity: Show "No current streams"

---

## File Structure

```
homepage/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── layout.tsx            # Shared dashboard layout
│   │   ├── page.tsx              # Main dashboard page
│   │   ├── mood/                 # Mood tracker page
│   │   │   └── page.tsx
│   │   ├── media/                # Media library page
│   │   │   ├── page.tsx
│   │   │   └── [slug]/           # Individual media detail
│   │   │       └── page.tsx
│   │   ├── exercise/             # Exercise tracking page
│   │   │   └── page.tsx
│   │   └── tasks/                # Task manager page
│   │       └── page.tsx
│   ├── api/                      # API routes (proxies)
│   │   ├── auth/                 # NextAuth routes
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── mood/                 # Mood tracker API
│   │   │   └── route.ts
│   │   ├── tasks/                # Task manager API
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── steam/                # Steam API proxy
│   │   │   ├── status/
│   │   │   └── recent/
│   │   ├── strava/               # Strava API proxy
│   │   │   ├── activities/
│   │   │   └── stats/
│   │   ├── plex/                 # Plex/Tautulli proxy
│   │   │   ├── activity/
│   │   │   └── recent/
│   │   └── homeassistant/        # Home Assistant proxy
│   │       ├── sensors/
│   │       └── state/
│   │           └── [entityId]/
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── widgets/                  # Dashboard widgets
│   │   ├── mood-tracker.tsx
│   │   ├── mood-entry-modal.tsx
│   │   ├── media-grid.tsx
│   │   ├── media-card.tsx
│   │   ├── exercise-stats.tsx
│   │   ├── exercise-chart.tsx
│   │   ├── steam-status.tsx
│   │   ├── plex-status.tsx
│   │   ├── home-assistant-widget.tsx
│   │   ├── task-list.tsx
│   │   ├── task-form.tsx
│   │   └── quick-links.tsx
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── theme-toggle.tsx
│   │   └── nav-menu.tsx
│   └── dashboard-grid.tsx        # Main dashboard grid
├── lib/
│   ├── db/                       # Database utilities
│   │   ├── index.ts              # DB connection
│   │   ├── schema.sql            # Database schema
│   │   ├── seed.ts               # Seed data script
│   │   ├── mood.ts               # Mood CRUD operations
│   │   ├── tasks.ts              # Task CRUD operations
│   │   └── cache.ts              # API cache operations
│   ├── api/                      # API client functions
│   │   ├── strava.ts             # Strava client
│   │   ├── steam.ts              # Steam client
│   │   ├── tautulli.ts           # Tautulli client
│   │   └── homeassistant.ts      # Home Assistant client
│   ├── mdx.ts                    # MDX processing utilities
│   ├── utils.ts                  # Shared utilities (cn, etc.)
│   └── env.ts                    # Environment variable validation
├── content/                      # Markdown content
│   ├── media/
│   │   ├── movies/
│   │   ├── tv/
│   │   └── books/
│   └── journal/
├── config/                       # Configuration files
│   ├── links.json                # Quick links config
│   └── homeassistant.json        # HA entity config
├── public/                       # Static assets
│   ├── images/
│   │   └── media/                # Media posters
│   └── icons/
├── data/                         # SQLite database (gitignored)
│   └── homepage.db
├── prisma/                       # Prisma schema (if using ORM)
│   └── schema.prisma
├── dev/                          # Development documentation
│   └── active/
│       └── homepage/
│           ├── homepage-plan.md
│           ├── homepage-context.md
│           └── homepage-tasks.md
├── Research/                     # Research documents
│   ├── comprehensive-research-findings.md
│   ├── plan.md
│   └── research-prd.md
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Example env file
├── .gitignore
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose config
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

---

## Environment Variables

### Required for MVP

```bash
# Database
DATABASE_URL="file:./data/homepage.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Strava API
STRAVA_CLIENT_ID="your-strava-client-id"
STRAVA_CLIENT_SECRET="your-strava-client-secret"

# Steam API
STEAM_API_KEY="your-steam-api-key"
STEAM_ID="your-steam-id-64"

# Home Assistant
HOMEASSISTANT_URL="http://homeassistant.local:8123"
HOMEASSISTANT_TOKEN="your-long-lived-access-token"

# Tautulli (Plex)
TAUTULLI_URL="http://localhost:8181"
TAUTULLI_API_KEY="your-tautulli-api-key"
```

### Optional Variables

```bash
# Feature Flags
ENABLE_STEAM=true
ENABLE_STRAVA=true
ENABLE_HOMEASSISTANT=true
ENABLE_PLEX=true

# Cache TTL (seconds)
CACHE_TTL_STRAVA=900      # 15 minutes
CACHE_TTL_STEAM=300       # 5 minutes
CACHE_TTL_HA=60           # 1 minute
CACHE_TTL_PLEX=120        # 2 minutes

# Development
NODE_ENV="development"
LOG_LEVEL="debug"
```

---

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Fill in API credentials
5. Run database migrations: `npm run db:migrate`
6. Seed database: `npm run db:seed`
7. Start dev server: `npm run dev`
8. Open http://localhost:3000

### Testing Strategy
- **Unit Tests**: Vitest for utility functions, API clients
- **Integration Tests**: Test API routes with mocked external APIs
- **E2E Tests**: Playwright for critical user flows (future)
- **Visual Tests**: Storybook for component library (future)

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config + custom rules
- **Prettier**: Code formatting (not yet configured, add if desired)
- **Husky**: Pre-commit hooks for linting (future)

### Git Workflow
- **Main Branch**: Production-ready code
- **Feature Branches**: `feature/mood-tracker`, `feature/strava-integration`
- **Commit Convention**: Conventional commits (feat, fix, docs, etc.)

---

## Constraints & Limitations

### Technical Constraints
1. **Single User**: No multi-user support, no user management
2. **Self-Hosted Only**: Not designed for cloud deployment (Vercel possible but not optimal)
3. **API Rate Limits**: Must respect external API limits (caching critical)
4. **Browser Support**: Modern browsers only (no IE11, ES6+ required)
5. **Mobile Web Only**: No native mobile apps

### API Constraints
1. **Strava**: 100 requests/15 min, 1000/day (aggressive caching required)
2. **Steam**: Profile must be public to fetch data
3. **Home Assistant**: Must be network-accessible from server
4. **Plex**: Requires Tautulli installation (not direct Plex API)

### Data Constraints
1. **SQLite**: Single-writer limitation (not an issue for single user)
2. **File System**: Markdown files read at build time (ISR for updates)
3. **Image Storage**: Local file system only (no CDN)

---

## Security Considerations

### Authentication & Authorization
- No authentication required to view dashboard (single user)
- OAuth tokens stored in NextAuth session (encrypted)
- All API keys server-side only (never exposed to client)

### Data Protection
- API keys in `.env.local` (gitignored)
- HTTPS required for production (reverse proxy)
- Content Security Policy headers
- Input validation with Zod

### API Security
- Rate limiting on API routes (prevent abuse)
- CORS configuration (same-origin only)
- API key rotation supported
- No sensitive data in logs

---

## Performance Targets

### Load Times
- **Initial Page Load**: <2 seconds (fast connection)
- **Widget Load**: <1 second (with cache)
- **Navigation**: <500ms (client-side routing)

### Lighthouse Scores
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 85+ (not critical for private dashboard)

### Bundle Size
- **JavaScript**: <300KB (gzipped)
- **CSS**: <50KB (gzipped)
- **Images**: Optimized with next/image

---

## Dependencies

### Core Dependencies
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.3.0"
}
```

### UI Dependencies
```json
{
  "@radix-ui/react-*": "Latest",
  "tailwindcss": "^3.4.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

### Data Dependencies
```json
{
  "better-sqlite3": "^9.0.0",
  "gray-matter": "^4.0.3",
  "next-mdx-remote": "^4.4.1",
  "zod": "^3.22.0"
}
```

### API Dependencies
```json
{
  "next-auth": "^5.0.0-beta",
  "@tanstack/react-query": "^5.0.0",
  "date-fns": "^3.0.0"
}
```

### Visualization Dependencies
```json
{
  "@uiw/react-heat-map": "^2.2.0",
  "recharts": "^2.10.0"
}
```

---

## Success Criteria

### Must-Have (MVP)
- [ ] All widgets display data correctly
- [ ] Mood tracker allows adding entries and viewing year heatmap
- [ ] Media library shows Markdown content with images
- [ ] Task manager supports add/complete/filter operations
- [ ] Strava integration shows recent runs and stats
- [ ] Steam integration shows currently playing game
- [ ] Home Assistant shows sensor values
- [ ] Plex shows server status and current streams
- [ ] Responsive on mobile, tablet, desktop
- [ ] Docker deployment works with persistence
- [ ] All API keys secured (server-side only)

### Nice-to-Have (Post-MVP)
- [ ] Drag-and-drop widget customization
- [ ] Real-time updates (WebSocket)
- [ ] PWA with offline mode
- [ ] Advanced exercise analytics
- [ ] Task reminders/notifications
- [ ] Obsidian wiki-style links

---

## Reference Links

### Documentation
- Next.js 15: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com/
- Tailwind CSS: https://tailwindcss.com/docs
- NextAuth.js: https://authjs.dev/

### API Documentation
- Strava API: https://developers.strava.com/docs/reference/
- Steam Web API: https://steamcommunity.com/dev
- Home Assistant API: https://developers.home-assistant.io/docs/api/rest/
- Tautulli API: https://github.com/Tautulli/Tautulli/wiki/Tautulli-API-Reference

### Research References
- Research findings: `Research/comprehensive-research-findings.md`
- Project requirements: `Research/research-prd.md`
- Initial plan: `Research/plan.md`

---

## Glossary

- **App Router**: Next.js routing system using `app/` directory (vs. Pages Router)
- **Frontmatter**: YAML metadata at the top of Markdown files
- **Heatmap**: Calendar-style grid showing data over time (like GitHub contributions)
- **ISR**: Incremental Static Regeneration (Next.js feature for updating static pages)
- **Long-Lived Access Token**: Home Assistant authentication token that doesn't expire
- **OAuth 2.0**: Authorization framework for third-party API access
- **Proxy Pattern**: Server-side API calls that hide credentials from client
- **Server Components**: React components that render on server (Next.js 13+)
- **shadcn/ui**: Component library using Radix UI + Tailwind (copy-paste approach)
- **Tautulli**: Monitoring tool for Plex Media Server with better API
- **TTL**: Time To Live (how long cached data is valid)
- **Year in Pixels**: Mood tracking visualization showing entire year as colored grid

---

**Document Version**: 1.0
**Last Updated**: 2025-11-10
**Status**: Ready for implementation
