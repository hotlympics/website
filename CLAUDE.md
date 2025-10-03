# Hotlympics Website

## Project Overview

Hotlympics is a face rating application where users can:

- View pairs of face images and rate which is more attractive
- Upload their own image after rating at least 10 pairs
- Sign in with an account to participate

## Technical Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## Code Style Guidelines

- **Indentation**: 4 spaces everywhere
- **Blank Lines**: No indentation on blank lines
- **Code Quality**: Clean, readable, and modular
- **Comments**: Conservative use only when necessary
- **React Components**: All components must be functional components (no class components)
- **File Naming**: Use kebab-case for all file names (e.g., `rating-arena.tsx`, not `RatingArena.tsx`)

## Project Structure

```
website/
├── src/
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── services/      # API and service layers
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
└── tests/             # Test files
```

## Key Features

1. **Image Pair Display**: Shows two face images side-by-side for rating
2. **Rating System**: Users choose the more attractive face
3. **Image Upload**: Users can upload their own image after rating 10+ pairs
4. **Authentication**: Account sign-in required for image uploads
5. **Elo Scoring**: Backend computes Elo scores from ratings

## Development Commands

```bash
npm run dev              # Start development server (http://localhost:8000)
npm run dev:local        # Start with SERVER_ENV=local for local backend
npm run build            # Build for production (includes TypeScript check)
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format code with Prettier
./run-checks.sh          # Run all CI checks (install, format, lint, build)
npm run deploy           # Build and deploy to Firebase Hosting
npm run deploy:preview   # Deploy to preview channel
```

## Development Workflow

After making code changes (not for every minor change, but after completing a set of related changes), run:

```bash
./run-checks.sh
```

This script will:

- Install dependencies
- Run linting and formatting
- Build the project
- Run type checking

Fix any linting or formatting errors before considering the changes complete.

This ensures dependencies are installed and the build succeeds. The user will manually run and test the website once the build completes successfully.

## Architecture

### API Integration

Backend API URL is determined dynamically by `src/utils/api.ts`:

- Uses `VITE_API_URL` environment variable if set
- Defaults to `http://localhost:3000` for localhost
- Uses network IP for LAN access

The frontend communicates with the backend server for:

- Fetching image pairs for rating
- Submitting rating results
- User authentication
- Image uploads
- Retrieving leaderboard data

### Authentication

Firebase Authentication is used for user management:

- **Magic Link**: Email-based passwordless authentication
- **Google OAuth**: Sign in with Google account
- **Auth Context**: `src/context/auth-context.tsx` provides global auth state
- **Auth Service**: `src/services/auth/firebase-auth.ts` handles Firebase operations

Auth state changes trigger cache clearing to prevent data leaks between users.

### Image Queue System

Core rating functionality uses a sophisticated image queue (`src/services/core/image-queue.ts`):

- **Double Buffering**: Maintains active and buffer blocks for smooth transitions
- **Block Size**: Fetches 10 images at a time (always divisible by 2 for pairing)
- **Preloading**: Aggressively preloads images to minimize perceived latency
- **Gender-Specific**: Separate queues for male/female image pools
- **Singleton Pattern**: Single queue instance shared across the app

The queue ensures users always have image pairs ready without waiting for network requests.

### Rating System (Glicko-2)

Images are rated using the Glicko-2 algorithm (evolution of Elo):

- **Rating (R)**: Display rating, default 1500
- **Rating Deviation (RD)**: Uncertainty measure, default 350
- **Volatility (σ)**: Rating stability over time, default 0.06
- **Internal Values**: System also tracks mu (μ) and phi (φ) for calculations

Image data structure includes:

- Battle statistics (wins, losses, draws)
- Pool status (active/inactive)
- Gender classification
- User association

All rating calculations happen server-side; frontend only displays and submits results.

### Caching Strategy

Multi-layer caching system (`src/services/cache/cache-manager.ts`):

- **Leaderboards**: Cached for 10 minutes with image preloading
- **User Profiles**: Cached for 2 hours
- **Image Cache**: Browser cache for preloaded images
- **Priority Mode**: Rating page gets priority to avoid interference with critical image loading
- **Background Refresh**: Expired caches refresh in background without blocking UI

Configuration in `src/config/cache-config.ts`.

### State Management

- **Auth Context**: Global authentication state via React Context
- **Custom Hooks**: Data fetching logic encapsulated in hooks
    - `src/hooks/rating/use-rating-queue.ts` - Rating queue management
    - `src/hooks/leaderboard/use-leaderboard.ts` - Leaderboard data
    - `src/hooks/profile/` - User profile operations
    - `src/hooks/auth/` - Authentication flows
- **Local State**: Component-level UI state with React hooks

## Routing

Main routes defined in `src/app.tsx`:

- `/` - Rating page (main interface)
- `/signin` - Authentication page
- `/profile` - User profile page
- `/upload` - Image upload page
- `/my-photos` - User's uploaded photos
- `/leaderboard` - Top rated images
- `/auth/*` - Auth verification routes
- `/admin/*` - Admin routes

All routes use React Router v7 with client-side routing.

## Build Configuration

Vite configuration (`vite.config.ts`) includes:

- **Plugins**: React SWC, Tailwind CSS, auto-imports, image optimization, compression
- **Auto-imports**: React and React Router hooks auto-imported (configured via `unplugin-auto-import`)
- **Path Alias**: `@/` maps to `./src/`
- **Dev Server**: Runs on port 8000 with network access enabled
- **Environment**: `__SERVER_ENV__` injected based on `SERVER_ENV` env variable

## Environment Variables

See `.env.example` for required variables:

- `VITE_API_URL` - Backend API URL (defaults to localhost:3000 if not set)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_FIREBASE_API_KEY` - Firebase configuration
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
