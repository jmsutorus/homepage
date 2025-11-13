# Personal Homepage & Dashboard

This is a personal dashboard application built with Next.js, designed to be a central hub for various aspects of your digital life. It integrates with multiple services to provide at-a-glance information and includes features for tracking media consumption, mood, and daily tasks.

## ✨ Features

- **Unified Dashboard**: A central page displaying widgets for various services.
- **Service Integrations**:
  - **Strava**: View recent workouts and activity stats.
  - **Steam**: See your current gaming status and recently played games.
  - **Home Assistant**: Monitor and interact with your smart home devices.
  - **Plex (via Tautulli)**: Check the status of your Plex media server.
  - **Google Calendar**: Connect to see your upcoming events.
- **Media Tracking**: Keep a log of movies, TV shows, and books you've consumed.
- **Mood Journal**: Track your mood over time with a heatmap visualization.
- **Task Management**: A simple to-do list to manage daily tasks.
- **Activity Calendar**: A calendar view of your Strava activities.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: [SQLite](https://www.sqlite.org/) with `better-sqlite3`
- **Content**: [MDX](https://mdxjs.com/) for journaling and content pages.

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [npm](https://www.npmjs.com/) or a compatible package manager

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/homepage.git
cd homepage/homepage
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the `homepage` directory by copying the example file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials for the services you want to use. See the respective setup guides for more details:
- `GOOGLE_CALENDAR_SETUP.md`
- `STRAVA_SETUP.md`
- `STRAVA_TOKEN_GUIDE.md`

### 4. Database Setup

The project uses a SQLite database. To initialize and seed it for the first time, run:

```bash
npm run db:seed
```
This will create a `homepage.db` file in the `homepage/data` directory.

### 5. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production build of the application.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run db:seed`: Initializes the database schema and seeds it with initial data.
- `npm run db:reset`: Deletes the existing database file and re-seeds it.