# Gemini Project Configuration: Homepage

This document provides a comprehensive overview of the `homepage` project, detailing its architecture, key technologies, and established conventions.

## Project Overview

This is a personal dashboard and homepage application built with Next.js. It integrates with various third-party services to display personal data and provides features like a media tracker, mood journal, and task list.

## Repository Structure

The repository is a monorepo with the main Next.js project located in the `homepage/` directory.

- `homepage/app/`: Contains the application's pages and components, following the Next.js App Router structure.
- `homepage/components/`: Contains reusable React components, categorized into `layout`, `ui` (for shadcn/ui components), and `widgets`.
- `homepage/lib/`: Core logic, including database access (`db/`), third-party API clients (`api/`), authentication (`auth-better.ts`), and utilities (`utils.ts`).
- `homepage/config/`: Configuration files for services like Home Assistant.
- `homepage/data/`: Contains the SQLite database file (`homepage.db`).
- `homepage/scripts/`: Node.js scripts for database migration and management.
- `homepage/public/`: Static assets like images and fonts.

## Key Technologies & Libraries

- **Framework**: [Next.js](https://nextjs.org/) (v16+) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/) (v19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4) with PostCSS.
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) (New York style) with `lucide-react` for icons.
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (v5) and a custom `better-auth` implementation.
- **Database**: [SQLite](https://www.sqlite.org/) accessed via `better-sqlite3`.
- **Content**: [MDX](https://mdxjs.com/) for content-heavy pages like the journal.
- **Linting/Formatting**: ESLint and Prettier.

## Integrations

The application integrates with the following services:

- **Strava**: Syncs exercise activities.
- **Google Calendar**: Displays upcoming events.
- **Home Assistant**: Shows smart home device statuses.
- **Plex / Tautulli**: Displays media server status.
- **Steam**: Shows gaming status and recently played games.

## Development Workflow

### Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run db:seed`: Seeds the database with initial data.
- `npm run db:reset`: Deletes the database file and re-seeds it.

### Conventions

- **Path Aliases**: The project uses path aliases defined in `components.json` and `tsconfig.json`. Always use aliases like `@/components` and `@/lib` for imports.
- **Styling**: Use Tailwind CSS utility classes for styling. Adhere to the `shadcn/ui` component style.
- **Components**: Follow the existing structure in `components/`. Reusable, low-level UI elements go in `components/ui`, while larger, more complex components go in `components/widgets`.
- **Database**: Database interactions should be defined in the `lib/db/` directory. Use the existing files as a template for new queries.
- **API Routes**: Server-side API logic is located in `app/api/`.

## MCP Servers

The following MCP servers are available for this project:

- `context7`: Provides access to pull the latest documentation on libraries
- `next-devtools`: Provides tools for interacting with the Next.js development server.
- `shadcn`: Offers utilities for working with shadcn components.