# Developer Documentation

This document contains technical setup instructions and development guidelines for the Personal Homepage & Dashboard application.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: [Turso](https://turso.tech/) (libSQL) with `@libsql/client`
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

**Optional: IMDB Integration (for Movie/TV Search)**
To enable the IMDB search feature when creating new media entries:

1. Get a free API key from [OMDb API](https://www.omdbapi.com/apikey.aspx)
2. Add the API key to your `.env.local`:
   ```
   OMDB_API_KEY=your_api_key_here
   ```
3. The "Search IMDB" button will now work in the media creation form!

**Optional: Google Books Integration (for Book Search)**
To enable the Google Books search feature when creating new media entries:

1. (Optional but recommended) Get a free API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select an existing one
   - Enable the "Books API"
   - Create credentials (API Key)
2. Add the API key to your `.env.local`:
   ```
   GOOGLE_BOOKS_API_KEY=your_api_key_here
   ```
3. The "Search Books" button will now work with higher quota limits!
   - Note: The Books API works without a key but with lower request limits

### 4. Database Setup

The project uses [Turso](https://turso.tech/) as the database provider. To set up your database:

1. Create a Turso account and database at [turso.tech](https://turso.tech/)
2. Add your database credentials to `.env.local`:
   ```
   DATABASE_URL=libsql://your-database.turso.io
   DATABASE_AUTH_TOKEN=your_auth_token_here
   ```
3. The database schema can be found in `lib/db/schema.sql` for reference

### 5. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🔐 Secret Management

This application uses **GCP Secret Manager** for secure secret storage in production, with automatic fallback to `.env.local` for local development.

### Local Development

Secrets are loaded from your `.env.local` file:

```bash
cp .env.example .env.local
# Fill in your secrets
npm run dev
```

### Production Deployment (Firebase App Hosting)

In production, secrets are automatically fetched from GCP Secret Manager at build time:

- **Authentication**: Uses Workload Identity Federation (no service account keys needed)
- **Build Process**: The `prebuild` script (`scripts/fetch-secrets.ts`) runs before each build
- **Secrets Stored in GCP**: 15 sensitive secrets (API keys, OAuth secrets, tokens)
- **Configuration in Code**: URLs, feature flags, and public IDs remain as environment variables

**What's in Secret Manager:**
- Database credentials
- OAuth client secrets (Google, GitHub, Strava)
- API keys (Steam, OMDb, Google Books, GitHub)
- Service tokens (Home Assistant, Tautulli, Firebase)

**What stays as environment variables:**
- Public client IDs
- Service URLs
- Feature flags
- Cache TTL configuration
- `NEXT_PUBLIC_*` variables (required for client bundle)

For detailed setup, secret rotation, and troubleshooting, see [`documentation/SECRET-MANAGEMENT.md`](documentation/SECRET-MANAGEMENT.md).

### Testing Secret Fetching

```bash
# Test GCP connection (requires gcloud authentication)
tsx scripts/test-secret-fetch.ts

# Build with secret fetching
npm run build

# Build locally without secret fetching
npm run build:local
```

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production build of the application.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase using ESLint.

## 🔄 CI/CD & Automation

This project uses GitHub Actions for continuous integration and automated releases:

### Continuous Integration (CI)
The CI workflow (`.github/workflows/ci.yml`) automatically runs on every push and pull request to the `main` or `master` branches:
- **Linting**: Validates code style and quality using ESLint
- **Testing**: Runs the full test suite to ensure code reliability

### Automated Releases
The release workflow (`.github/workflows/release.yml`) uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate version management and package publishing:
- Automatically determines version bumps based on commit messages
- Generates release notes from commit history
- Creates GitHub releases automatically
- Follows [Conventional Commits](https://www.conventionalcommits.org/) specification

**Commit Message Format:**
- `feat:` - New features (triggers minor version bump)
- `fix:` - Bug fixes (triggers patch version bump)
- `BREAKING CHANGE:` - Breaking changes (triggers major version bump)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` - No version bump

### Code Ownership
The `.github/CODEOWNERS` file defines code ownership for the repository, ensuring that @jmsutorus is automatically requested for review on all pull requests.
