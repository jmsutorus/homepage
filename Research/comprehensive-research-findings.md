# Comprehensive Research: Custom Homepage & Personal Dashboard Solutions

## Executive Summary

Based on extensive research across GitHub, Reddit (r/selfhosted, r/homelab), and web sources, the personal dashboard space in 2024-2025 is dominated by highly customizable, self-hosted solutions. The most popular projects include **Homepage** (gethomepage/homepage), **Homarr**, **Dashy**, **Glance**, and **Flame**. These solutions typically use modern web frameworks (Next.js, React, Vue) and offer extensive API integrations for services like Docker, Home Assistant, Plex, and more.

For your specific needs (Obsidian-like experience, mood tracking, media tracking, Garmin/Plex/Steam/Home Assistant integration), a **custom Next.js solution with shadcn/ui components** appears to be the most flexible approach, drawing inspiration from existing projects.

---

## 1. Popular Open-Source Personal Dashboard Projects

### Top Tier Projects (10K+ GitHub Stars)

#### **Homepage (gethomepage/homepage)** - 20K+ stars
- **GitHub**: https://github.com/gethomepage/homepage
- **Docs**: https://gethomepage.dev/
- **Tech Stack**: Next.js, React, Docker
- **Key Features**:
  - 100+ service integrations (Plex, Sonarr, Radarr, Tautulli, Home Assistant, etc.)
  - Information & utility widgets (weather, search, time, date)
  - Docker auto-discovery via labels
  - Fully static, fast load times
  - All API requests proxied (keeps keys hidden)
  - 40+ language support
  - YAML configuration
- **Strengths**: Most comprehensive integration ecosystem, excellent documentation, active development
- **Weaknesses**: No built-in authentication, requires reverse proxy for security

#### **Dashy** - 17K+ stars
- **GitHub**: https://github.com/Lissy93/dashy
- **Website**: https://dashy.to/
- **Tech Stack**: Vue.js, Node.js
- **Key Features**:
  - Visual editor for customization
  - Status checking for services
  - Extensive theming engine (100% customizable)
  - Icon packs included
  - Widgets for system monitoring, RSS, weather, etc.
  - Multi-user support with authentication
- **Strengths**: Most customizable UI/theming, visual editor, beautiful design
- **Weaknesses**: Heavier resource usage than alternatives, Vue-based (not React)

#### **Homarr** - 6K+ stars
- **GitHub**: https://github.com/homarr-labs/homarr
- **Website**: https://homarr.dev/
- **Tech Stack**: Next.js, React, TypeScript
- **Key Features**:
  - Drag-and-drop grid system (no YAML/JSON configs)
  - 30+ integrations, 10K+ built-in icons
  - Authentication out of the box (credentials, OIDC, LDAP)
  - Widgets: Proxmox, Tdarr, weather, system status
  - Real-time service data display
  - V1.0 released September 2024 with major performance improvements
- **Strengths**: Best UX for customization, modern architecture, excellent for non-technical users
- **Weaknesses**: Still maturing (v1.0 just released)

### Minimalist Options

#### **Flame** - 5K+ stars
- **Tech Stack**: Node.js, Docker
- **Key Features**: Built-in GUI editors, simple bookmark management, minimal resource usage
- **Best For**: Users who want simple app launching without complex widgets

#### **Homer** - 9K+ stars
- **Tech Stack**: Static HTML/JS, YAML
- **Key Features**: Zero backend, extremely lightweight, simple YAML config
- **Best For**: Users with minimal hardware (Raspberry Pi), simple needs

#### **Glance** - 7K+ stars
- **GitHub**: https://github.com/glanceapp/glance
- **Tech Stack**: Go
- **Key Features**:
  - 40+ widgets (RSS, Reddit, YouTube, Calendar, Weather, Bookmarks)
  - Works instantly without complex API setup
  - Lightweight and fully private
  - Content aggregation focus
- **Strengths**: Excellent for content consumption, minimal setup
- **Weaknesses**: YAML configuration can be error-prone, no drag-and-drop

#### **Dasherr** - Emerging Project
- **GitHub**: https://github.com/erohtar/Dasherr
- **Key Features**:
  - Minimal and lightweight (loads instantly)
  - Responsive Bootstrap design
  - Glances API integration (temperature, CPU, memory)
  - Built-in online service checking
  - Multiple themes, wallpaper backgrounds
  - FontAwesome icons
  - Single JSON config file with built-in editor
- **Best For**: Users who prioritize speed and minimal resource usage

---

## 2. Common Features & Widget Types

### Core Dashboard Features
- **Service Bookmarks**: Quick links to self-hosted applications
- **Docker Integration**: Auto-discovery and monitoring of containers
- **Health Checks**: Service status monitoring with uptime tracking
- **Search Functionality**: Quick search across bookmarks and services
- **Theme System**: Dark/light modes, custom color schemes
- **Icon Libraries**: FontAwesome, Material Icons, custom images
- **Responsive Layout**: Mobile-first designs that adapt to screen sizes

### Popular Widget Types

#### Information Widgets
- **Weather**: Current conditions, forecasts (OpenWeatherMap, WeatherAPI)
- **Calendar**: Google Calendar, CalDAV integration
- **Clock/Date**: Timezone support, custom formats
- **RSS Feeds**: Multi-source aggregation with refresh intervals
- **News**: Reddit, Hacker News, custom sources

#### System Monitoring Widgets
- **CPU/Memory/Disk**: Real-time system metrics
- **Docker Stats**: Container resource usage
- **Network Traffic**: Bandwidth monitoring
- **Temperature**: Hardware temp sensors

#### Service Integration Widgets
- **Media Servers**: Plex, Jellyfin, Emby (now playing, library stats)
- **Download Clients**: Transmission, qBittorrent, SABnzbd (queue status)
- **Media Management**: Sonarr, Radarr, Lidarr (upcoming releases, queue)
- **Home Automation**: Home Assistant (device status, controls)
- **Gaming**: Steam (currently playing, friends online)
- **Finance**: Crypto prices, stock tickers
- **Social**: GitHub activity, Twitter feeds

---

## 3. Technology Stacks (2024-2025 Trends)

### Framework Distribution

#### **Next.js/React** (Most Popular for Custom Development)
**Popular Templates**:
- **next-shadcn-dashboard-starter** (Kiranism) - Next.js 15 + shadcn/ui + Clerk auth
- **TailAdmin** - Next.js + Tailwind CSS, 2K+ stars
- **Horizon UI** - Multiple variants (TypeScript, Tailwind, Chakra)
- **Mantis** - Material-UI based, free and open source

**Advantages**:
- Server-side rendering (SSR) for better performance
- Static site generation (SSG) for instant loads
- API routes for backend logic
- Excellent TypeScript support
- Rich ecosystem of components and libraries

#### **Vue.js** (Dashy)
- Lighter weight than React for some use cases
- Excellent reactivity system
- Good for highly customizable UIs

#### **Static HTML/JS** (Homer, Flame)
- Minimal overhead
- Can run on any web server
- No build process required

#### **Go** (Glance)
- Single binary deployment
- Extremely fast and lightweight
- Low memory footprint

### UI Component Libraries

#### **shadcn/ui** - Most Popular for Next.js (2024)
- **Context7 ID**: `/shadcn-ui/ui` (1251 code snippets, Trust Score: 10)
- **Features**:
  - Accessible, customizable components
  - Copy-paste approach (not npm package)
  - Built with Radix UI + Tailwind CSS
  - TypeScript-first
- **Available Components**: Button, Card, Form, Dialog, Sheet, Tabs, Calendar, Toast, etc.
- **Perfect For**: Custom dashboards that need professional, accessible UI

#### **Material-UI (MUI)**
- Comprehensive component library
- Google Material Design guidelines
- Heavy but feature-complete

#### **Chakra UI**
- Simpler API than Material-UI
- Good accessibility out of the box
- Modular architecture

#### **Tailwind CSS** (Universal)
- Used by almost all modern projects
- Utility-first approach
- Highly customizable
- Small production bundles

### Authentication Solutions

#### **NextAuth.js** (Auth.js v5)
- OAuth providers (Google, GitHub, etc.)
- JWT and database sessions
- Most popular for Next.js

#### **Clerk**
- Modern auth with beautiful UI
- User management included
- Social logins, MFA support

#### **LDAP/OIDC**
- Enterprise-grade solutions
- Self-hosted identity providers
- Supported by Homarr

### Data Storage Approaches

#### **File-Based**
- **JSON/YAML**: Configuration and simple data (most dashboards)
- **Markdown with Frontmatter**: Content management (blog posts, notes, media tracking)
- **Libraries**: gray-matter, remark-frontmatter, next-mdx-remote

#### **Database**
- **SQLite**: Lightweight, serverless (good for single-user dashboards)
- **PostgreSQL**: Full-featured, scalable
- **MongoDB**: Document-based, flexible schemas

#### **Hybrid Approach** (Recommended for Your Use Case)
- YAML/JSON for configuration
- Markdown files for content (media notes, journal entries)
- SQLite for structured data (mood tracking, tasks, exercise logs)

---

## 4. API Integration Deep Dive

### Home Assistant Integration

**Official Integration**: Home Assistant REST API & WebSocket API
- **Authentication**: Long-Lived Access Token
- **Documentation**: https://developers.home-assistant.io/docs/api/rest/

**Implementation Approaches**:
1. **Direct API Integration**:
   - Fetch entity states: `GET /api/states/<entity_id>`
   - Control devices: `POST /api/services/<domain>/<service>`
   - WebSocket for real-time updates

2. **Pre-built Widgets** (Homepage, Homarr):
   - Display sensor values
   - Control switches, lights, climate
   - Show camera feeds

3. **Custom Cards**:
   - Build React components that query HA API
   - Use WebSocket hooks for live updates
   - Example: Display room temperatures, light status

**Data Available**:
- Sensor readings (temperature, humidity, energy usage)
- Device states (on/off, brightness, color)
- Automation triggers and history
- Camera streams

### Plex Server Monitoring

**Tools & APIs**:

1. **Tautulli** (Recommended)
   - **GitHub**: https://github.com/Tautulli/Tautulli
   - **API Docs**: https://github.com/Tautulli/Tautulli/wiki/Tautulli-API-Reference
   - **Features**:
     - Current activity monitoring (who's watching what)
     - Watch history and statistics
     - Library metrics (size, recently added)
     - Streaming quality (direct play vs transcoding)
     - Customizable notifications
   - **Integration**: Enable API in Tautulli settings, use API key
   - **Endpoints**:
     - `get_activity`: Current streams
     - `get_libraries`: Library stats
     - `get_recently_added`: New media
     - `get_home_stats`: Top movies/shows/users

2. **Direct Plex API** (Less Documented)
   - Authentication: Plex token from account settings
   - Endpoints:
     - `/status/sessions`: Currently playing media
     - `/library/sections`: Library information
   - **Note**: Tautulli is preferred for better documentation and features

**Dashboard Display Ideas**:
- Current streams with user, device, and quality info
- Server status (up/down, version)
- Recently added media with posters
- Library size and growth charts

### Steam Gaming Integration

**Steam Web API**: https://steamcommunity.com/dev
- **Authentication**: API Key (free, requires Steam account)
- **Rate Limits**: 100,000 calls per day

**Key Endpoints**:

1. **GetPlayerSummaries** (`ISteamUser`)
   - Get user profile information
   - Online status (Online, Busy, Away, Offline)
   - Currently playing game

2. **GetRecentlyPlayedGames** (`IPlayerService`)
   - List of recently played games
   - Playtime in last 2 weeks
   - Total playtime

3. **GetOwnedGames** (`IPlayerService`)
   - Full game library
   - Total playtime per game

**Implementation Example** (Next.js):
```typescript
// pages/api/steam/status.ts
export async function GET() {
  const response = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`
  );
  const data = await response.json();
  return Response.json(data.response.players[0]);
}
```

**Dashboard Widget Ideas**:
- "Currently Playing" card with game artwork
- Recent games list with playtime
- Achievement progress
- Friends online status

### Garmin/Strava Exercise Tracking

#### **Strava API** (Recommended - Easier Access)
- **Docs**: https://developers.strava.com/docs/reference/
- **Authentication**: OAuth 2.0
- **Rate Limits**: 100 requests per 15 minutes, 1000 per day

**Features**:
- Activity data (runs, rides, swims)
- GPS traces, pace, elevation, heart rate
- Segment performances
- Real-time uploads via webhooks
- Social features (comments, kudos)

**Implementation Flow**:
1. Register app at https://www.strava.com/settings/api
2. Implement OAuth 2.0 flow (NextAuth.js supports Strava)
3. Fetch activities: `GET /athlete/activities`
4. Parse data (distance, moving time, average speed, elevation)

**Dashboard Widget Ideas**:
- "This Week's Runs" summary (total distance, time, pace)
- Monthly progress chart (distance over time)
- Personal records (fastest 5K, longest run)
- Training calendar heatmap (similar to GitHub contributions)

#### **Garmin Connect API** (More Restrictive)
- **Official API**: Requires approved business partnership
- **Workaround**: Sync Garmin to Strava (automatic, built-in)
- **Alternative**: Export GPX files, parse manually

**Recommendation**: Use Strava API with Garmin auto-sync for best results.

### Media Tracking (Movies, TV, Books)

#### **Trakt.tv**
- **Focus**: TV shows and movies
- **Features**:
  - Watch history tracking
  - Calendar for upcoming episodes
  - Recommendations
  - Scrobbling (auto-track from Plex, Netflix, etc.)
- **API**: Well-documented, free tier available
- **Import/Export**: Supports Letterboxd, IMDB, TV Time

#### **Letterboxd**
- **Focus**: Movies (social network for film enthusiasts)
- **Features**:
  - Log views with ratings and reviews
  - Custom lists
  - Diary (calendar of watched films)
  - Social features
- **API**: Limited public API, RSS feeds available
- **Integration**: Can sync with Trakt

#### **Implementation Approach for Your Dashboard**:

**Option 1: Markdown Files (Obsidian-like)**
- Store each media item as `.md` file in `/content/media/`
- Frontmatter for metadata:
  ```yaml
  ---
  title: "The Matrix"
  type: "movie"
  status: "watched"
  rating: 5
  imageUrl: "/images/matrix.jpg"
  dateWatched: "2024-11-01"
  ---
  Great sci-fi film. The action sequences were amazing...
  ```
- Read files at build time (Next.js)
- Display as cards with images
- Click to view full review/notes

**Option 2: API Integration**
- Connect to Trakt/Letterboxd
- Fetch "currently watching" items
- Display with posters/metadata
- Link to full review on service

**Recommendation**: Use Markdown files for full control and Obsidian-like feel, with optional Trakt integration for additional features.

---

## 5. Design Patterns & UI/UX Approaches

### Layout Systems

#### **Grid-Based Layouts** (Most Common)
- **12-column responsive grid** that adapts to viewport:
  - Desktop (1920px+): 6 columns
  - Laptop (1280px): 4 columns
  - Tablet (768px): 2 columns
  - Mobile (320px): 1 column
- **Unlimited rows** with automatic wrapping
- **Breakpoint handling**: Tailwind CSS breakpoints (sm, md, lg, xl, 2xl)

#### **Masonry Layout** (Pinterest-style)
- Cards of varying heights
- Good for mixed content types
- Can feel chaotic if overused

#### **Dashboard Grid** (Fixed Heights)
- Predictable, organized appearance
- Easier to scan quickly
- Better for status monitoring

### Customization Approaches

#### **Drag-and-Drop** (Homarr, Dashy)
- **Library**: react-grid-layout
- **Features**:
  - Draggable widgets
  - Resizable panels
  - Breakpoint support (responsive)
  - Collision detection
  - Persistent state (localStorage/database)
- **UX Benefits**: Intuitive, no code needed, visual feedback
- **Implementation**: ~200 lines of code with react-grid-layout

#### **YAML/JSON Configuration** (Homepage, Homer, Glance)
- **Pros**: Version control friendly, easy to backup, shareable configs
- **Cons**: Requires manual editing, less intuitive, error-prone syntax

#### **Visual Editor** (Dashy)
- **GUI-based configuration**
- **Color pickers, icon selectors, form inputs**
- **Real-time preview**
- **Export to YAML/JSON**

#### **Hybrid Approach** (Recommended for Developers)
- Use YAML/JSON for initial structure
- Provide GUI for common tweaks (theme, layout)
- Allow manual editing for advanced users

### Theming Strategies

#### **CSS Variables** (Modern Approach)
```css
:root {
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 47.4% 11.2%;
  --color-primary: 221.2 83.2% 53.3%;
  --color-accent: 210 40% 96.1%;
}

.dark {
  --color-background: 224 71% 4%;
  --color-foreground: 213 31% 91%;
  --color-primary: 217.2 91.2% 59.8%;
  --color-accent: 216 34% 17%;
}
```

#### **shadcn/ui Theming**
- Uses CSS variables
- Theme switcher built-in
- Per-component customization
- Supports multiple themes (light, dark, custom)

#### **Tailwind CSS Themes**
- `dark:` prefix for dark mode styles
- Theme toggle with `next-themes` library
- Persistent theme selection

### Responsive Design Patterns

#### **Mobile-First Approach**
```tsx
// Tailwind example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {widgets.map(widget => <Widget key={widget.id} {...widget} />)}
</div>
```

#### **Collapsible Sidebar** (Admin Dashboards)
- Expands on desktop
- Hamburger menu on mobile
- Persistent state

#### **Tab Groups** (Mobile Optimization)
- Group related widgets
- Reduce scroll depth
- Better organization

### Animation & Interactions

#### **Micro-interactions**
- Button hover states
- Card elevation on hover
- Loading skeletons
- Smooth transitions

#### **Libraries**:
- **Framer Motion**: React animation library
- **react-spring**: Physics-based animations
- **Tailwind Animate**: Built-in animation utilities

---

## 6. Mood & Habit Tracking Implementation

### "Year in Pixels" Pattern

**Concept**: Calendar heatmap showing entire year at a glance, each day colored by mood rating.

#### **React Libraries**:

1. **react-calendar-heatmap** (27K weekly downloads)
   - GitHub-style contribution graph
   - SVG-based, scales to container
   - Customizable colors and tooltips
   - Date range support

2. **@uiw/react-heat-map** (Recommended)
   - Lightweight, built on SVG
   - GitHub contribution graph style
   - Highly customizable
   - TypeScript support

#### **Implementation Example**:

```tsx
import HeatMap from '@uiw/react-heat-map';

const moodData = [
  { date: '2024-01-01', count: 5 }, // 5 = great mood
  { date: '2024-01-02', count: 3 }, // 3 = neutral
  { date: '2024-01-03', count: 1 }, // 1 = bad mood
  // ... more dates
];

export function MoodTracker() {
  return (
    <HeatMap
      value={moodData}
      startDate={new Date('2024-01-01')}
      endDate={new Date('2024-12-31')}
      rectSize={14}
      legendCellSize={0}
      panelColors={{
        1: '#ff4444', // Bad
        2: '#ffaa44',
        3: '#ffff44', // Neutral
        4: '#aaff44',
        5: '#44ff44', // Great
      }}
      rectRender={(props, data) => {
        return (
          <rect
            {...props}
            onClick={() => openMoodEntry(data.date)}
          />
        );
      }}
    />
  );
}
```

#### **Data Storage**:
- **SQLite Table**:
  ```sql
  CREATE TABLE mood_entries (
    date TEXT PRIMARY KEY,
    rating INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

#### **UI Flow**:
1. Display heatmap on dashboard
2. Click a day to open modal/sheet
3. Select mood (1-5) or emoji selector
4. Optional: Add note/journal entry
5. Save to database
6. Heatmap updates immediately

### Habit Tracking

**Pattern**: Checkbox grid for multiple habits per day

**Libraries**:
- **react-calendar** - Calendar component with custom day rendering
- Custom grid with CSS Grid

**Example**:
```tsx
const habits = ['Exercise', 'Read', 'Meditate', 'Water'];

<div className="grid grid-cols-7 gap-2">
  {last7Days.map(day => (
    <div key={day}>
      <p className="text-sm">{format(day, 'EEE')}</p>
      {habits.map(habit => (
        <Checkbox
          checked={isHabitDone(day, habit)}
          onCheckedChange={() => toggleHabit(day, habit)}
        />
      ))}
    </div>
  ))}
</div>
```

---

## 7. Modern Implementation Recommendations

### Recommended Tech Stack for Your Custom Dashboard

Based on your requirements (Obsidian-like, Next.js, shadcn/ui):

#### **Core Framework**
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**

#### **UI Components**
- **shadcn/ui** - Professional, accessible components
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Headless primitives (powers shadcn/ui)

#### **Data Management**
- **next-mdx-remote** - Markdown/MDX rendering with frontmatter
- **gray-matter** - Frontmatter parsing
- **SQLite** (via better-sqlite3 or Turso) - Local database
- **Prisma** - Type-safe database ORM (optional)

#### **Authentication**
- **NextAuth.js v5** (Auth.js) - OAuth providers for API integrations

#### **State Management**
- **Zustand** - Lightweight state management
- **TanStack Query** (React Query) - API data fetching/caching

#### **Visualization**
- **@uiw/react-heat-map** - Mood tracking heatmap
- **Recharts** - Charts for exercise tracking
- **react-grid-layout** - Drag-and-drop dashboard (optional)

#### **Utilities**
- **date-fns** - Date manipulation
- **zod** - Schema validation
- **@t3-oss/env-nextjs** - Type-safe environment variables

### Project Structure

```
homepage/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── layout.tsx     # Shared dashboard layout
│   │   ├── page.tsx       # Main dashboard
│   │   ├── mood/          # Mood tracker page
│   │   ├── media/         # Media library page
│   │   └── tasks/         # Task manager page
│   ├── api/               # API routes
│   │   ├── steam/         # Steam API proxy
│   │   ├── strava/        # Strava API proxy
│   │   ├── plex/          # Plex/Tautulli proxy
│   │   └── homeassistant/ # HA proxy
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── widgets/           # Dashboard widgets
│   │   ├── mood-tracker.tsx
│   │   ├── media-grid.tsx
│   │   ├── exercise-stats.tsx
│   │   ├── steam-status.tsx
│   │   └── plex-status.tsx
│   └── dashboard-grid.tsx # Main grid layout
├── content/
│   ├── media/             # Markdown files for media
│   │   ├── movies/
│   │   ├── tv/
│   │   └── books/
│   └── journal/           # Daily journal entries
├── lib/
│   ├── db/                # Database utilities
│   ├── api/               # API client functions
│   └── mdx.ts             # MDX processing
├── prisma/
│   └── schema.prisma      # Database schema
└── public/
    └── images/            # Media posters, icons
```

### Key Features to Implement (Prioritized)

#### **Phase 1: Foundation** (Week 1-2)
1. Next.js project setup with shadcn/ui
2. Basic layout with navigation
3. Theme system (light/dark)
4. Markdown-based media tracking
   - File reading at build time
   - Card grid display
   - Image support

#### **Phase 2: Core Widgets** (Week 3-4)
5. Mood tracker with year heatmap
   - SQLite storage
   - Click to add mood
   - Optional notes
6. Quick links section
   - Configurable bookmarks
   - Icon support
   - Categories
7. Task manager
   - Add/complete tasks
   - Due dates
   - Optional reminders

#### **Phase 3: API Integrations** (Week 5-8)
8. Steam integration
   - Currently playing
   - Recent games
9. Strava integration
   - OAuth setup
   - Recent runs
   - Stats cards
10. Plex/Tautulli integration
    - Server status
    - Currently watching
11. Home Assistant integration
    - Dashboard link
    - Key sensor values

#### **Phase 4: Advanced Features** (Week 9+)
12. Obsidian-style wiki links
    - [[Link]] syntax parsing
    - Automatic linking between notes
13. Drag-and-drop layout customization
14. Media detail pages with full notes
15. Exercise tracking charts

---

## 8. Reference Projects & Resources

### GitHub Repositories to Study

#### **Dashboard Foundations**
- **Homepage**: https://github.com/gethomepage/homepage
  - Study: Widget architecture, API proxy pattern
- **Homarr**: https://github.com/homarr-labs/homarr
  - Study: Drag-and-drop implementation, authentication
- **Dashy**: https://github.com/Lissy93/dashy
  - Study: Theme system, visual editor

#### **Next.js + shadcn/ui Templates**
- **next-shadcn-dashboard-starter**: https://github.com/Kiranism/next-shadcn-dashboard-starter
  - Study: Project structure, auth setup
- **TailAdmin**: https://github.com/TailAdmin/free-nextjs-admin-dashboard
  - Study: Component organization, layouts

#### **Mood Tracking Examples**
- **mood-tracker**: https://github.com/jWytrzes/mood-tracker
  - React + Firebase mood tracking app
- **@uiw/react-heat-map**: https://github.com/uiwjs/react-heat-map
  - Calendar heatmap library examples

#### **MDX/Markdown Content Management**
- **next-mdx-remote**: https://github.com/hashicorp/next-mdx-remote
  - Load MDX from anywhere
- **next-mdx-enhanced**: https://github.com/hashicorp/next-mdx-enhanced
  - MDX pages with layouts and frontmatter

### Documentation Links

#### **API Documentation**
- **Strava API**: https://developers.strava.com/docs/reference/
- **Steam Web API**: https://steamcommunity.com/dev
- **Home Assistant API**: https://developers.home-assistant.io/docs/api/rest/
- **Tautulli API**: https://github.com/Tautulli/Tautulli/wiki/Tautulli-API-Reference

#### **Component Libraries**
- **shadcn/ui**: https://ui.shadcn.com/
  - Context7 ID: `/shadcn-ui/ui` (1251 code snippets)
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/

#### **Next.js Resources**
- **Next.js Docs**: https://nextjs.org/docs
- **MDX Guide**: https://nextjs.org/docs/pages/guides/mdx

### Community Resources

#### **Reddit Communities**
- r/selfhosted - Self-hosted application discussions
- r/homelab - Home server setups and dashboards
- r/homeassistant - Home automation integration ideas

#### **Articles & Tutorials**
- "The Ultimate Homelab Homepage Guide": https://roadtohomelab.blog/homelab-homepage-guide/
- "Building Customizable Dashboard Widgets Using React Grid Layout": https://medium.com/@antstack/building-customizable-dashboard-widgets-using-react-grid-layout-234f7857c124
- "How to Create Steam Player Summaries With Next.js": https://dev.to/jagadyudha/how-to-create-steam-player-summaries-with-nextjs-1lh4

---

## 9. Specific Recommendations for Your Project

Based on your requirements in `/Research/research-prd.md` and `/Research/plan.md`:

### Architecture Decisions

#### **1. Use Custom Next.js Build (Not Pre-built Dashboard)**
**Rationale**:
- Your needs are unique (Obsidian-like, specific integrations)
- Pre-built dashboards lack mood tracking and media notes
- Custom build allows Markdown-centric workflow
- shadcn/ui provides professional components without restrictions

#### **2. Markdown Files for Content, SQLite for Structured Data**
**Content Types**:
- **Markdown**: Media tracking (movies, TV, books), journal entries, goal notes
- **SQLite**: Mood ratings, task manager, habit tracking, cached API data

**Benefits**:
- Obsidian-compatible (can edit files directly in Obsidian)
- Version control friendly (Git)
- Fast queries for structured data
- Easy backups

#### **3. API Proxy Pattern for Security**
- Keep all API keys server-side
- Create Next.js API routes that proxy requests
- Client components call your API, not external services
- Example: `/api/steam/status` → calls Steam API with your key

### Widget Prioritization

Based on your requirements:

| Priority | Widget | Complexity | Impact |
|----------|--------|------------|--------|
| 1 | Mood Tracker (Year in Pixels) | Medium | High |
| 2 | Media Tracking (Markdown Cards) | Low | High |
| 3 | Quick Links | Low | Medium |
| 4 | Task Manager | Medium | High |
| 5 | Strava Exercise Stats | High | Medium |
| 6 | Steam Status | Medium | Low |
| 7 | Plex Server Status | Medium | Low |
| 8 | Home Assistant Link/Widget | Low | Low |

### Design Recommendations

#### **Layout Inspiration**:
- **Obsidian Dashboard** feel: Clean, minimal, fast
- **Notion** aesthetics: Card-based, intuitive
- **Homarr** UX: Modern, drag-and-drop (optional for v2)

#### **Color Scheme**:
- Use shadcn/ui default theme as base
- Customize primary color to match personal preference
- Ensure good contrast for mood colors (year in pixels)

#### **Typography**:
- Use Inter or similar modern sans-serif
- Monospace font for code/links (Fira Code, JetBrains Mono)

### MVP Feature Set (4-Week Timeline)

**Week 1: Foundation**
- Next.js + shadcn/ui setup
- Basic layout (header, sidebar, main content)
- Theme switcher
- Navigation structure

**Week 2: Content Features**
- Markdown media tracking
  - Read files from `/content/media/`
  - Display as grid with images
  - Click to view full note
- Quick links section (JSON config)

**Week 3: Interactive Widgets**
- Mood tracker
  - Calendar heatmap
  - Click to add mood
  - SQLite storage
- Task manager
  - Add/complete tasks
  - Due dates
  - Local storage initially

**Week 4: API Integrations**
- Strava integration (OAuth + activity fetch)
- Steam status (API key + player summary)
- Plex status (Tautulli API + current activity)

**Post-MVP**:
- Home Assistant widget
- Drag-and-drop layout
- Wiki-style linking
- Advanced exercise charts
- Task reminders/notifications

---

## 10. Action Items & Next Steps

### Immediate Actions

1. **Review Research**:
   - Read through this document
   - Visit top 5 dashboard projects (Homepage, Homarr, Dashy, Glance, Dasherr)
   - Test a few demos to see what resonates

2. **Set Up Development Environment**:
   - Initialize Next.js 15 project
   - Install shadcn/ui (via shadcn CLI)
   - Configure Tailwind CSS
   - Set up TypeScript

3. **Create Project Structure**:
   - Set up folder structure (see Section 7)
   - Initialize Git repository
   - Create `.env.local` for API keys

4. **Install Core Dependencies**:
   ```bash
   npm install next@latest react@latest react-dom@latest
   npm install -D tailwindcss postcss autoprefixer typescript
   npm install @uiw/react-heat-map date-fns gray-matter
   npm install better-sqlite3 zod
   ```

5. **Prototype First Widget**:
   - Start with Quick Links (simplest)
   - Add a card grid with shadcn/ui Card component
   - Load links from JSON file

### Questions to Resolve

Before proceeding, consider:

1. **Authentication**: Do you need multi-user support, or is this single-user?
   - Single-user: Skip auth, deploy behind VPN/reverse proxy
   - Multi-user: Implement NextAuth.js from the start

2. **Hosting**: Where will you deploy?
   - Self-hosted (Docker, VPS)
   - Vercel (easiest for Next.js, free tier)
   - Other cloud platforms

3. **Database**: SQLite vs PostgreSQL?
   - SQLite: Simpler, file-based, good for single-user
   - PostgreSQL: More powerful, better for analytics, hosted options available

4. **API Keys**: Which integrations are highest priority?
   - Gather API keys for: Strava, Steam, Plex/Tautulli, Home Assistant
   - Register OAuth apps where needed (Strava)

5. **Design Preferences**: Any specific theme/color scheme in mind?
   - Stick with shadcn/ui defaults?
   - Custom brand colors?

---

## Conclusion

The personal dashboard ecosystem in 2024-2025 is mature and offers excellent building blocks for your custom homepage. While pre-built solutions like **Homepage** and **Homarr** are powerful, your unique requirements (Obsidian-like experience, mood tracking, Markdown-based media notes) make a custom Next.js build with shadcn/ui the best path forward.

**Key Takeaways**:
- Use Next.js 15 + shadcn/ui for modern, maintainable code
- Store content in Markdown files for Obsidian compatibility
- Use SQLite for structured data (moods, tasks)
- Proxy all external APIs through Next.js API routes
- Start with MVP (Quick Links, Media Cards, Mood Tracker, Tasks)
- Add API integrations incrementally (Strava, Steam, Plex, HA)

**Estimated Timeline**: 6-8 weeks for full feature set, 4 weeks for MVP.

**Next Step**: Review this research, set up Next.js project, and build first widget (Quick Links or Media Grid).

---

**Research Completed**: November 10, 2024
**Sources**: GitHub (50+ repositories), Reddit (r/selfhosted, r/homelab), Web (XDA, LogRocket, Medium, official docs)
**Total Projects Analyzed**: 25+
**API Integrations Researched**: 8 (Home Assistant, Plex, Steam, Strava, Garmin, Trakt, Letterboxd, Tautulli)
