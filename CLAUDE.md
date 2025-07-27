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
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run linter
npm run typecheck  # Run TypeScript type checking
./run-checks.sh    # Run all CI checks locally
```

## API Integration

The frontend communicates with the backend server for:

- Fetching image pairs
- Submitting ratings
- User authentication
- Image uploads
- Retrieving Elo scores

## Component Architecture

- **RatingView**: Main component for displaying and rating image pairs
- **ImageUpload**: Handles user image uploads with validation
- **AuthForm**: User authentication (sign in/sign up)
- **UserProfile**: Displays user stats and uploaded images
- **LeaderBoard**: Shows top-rated images with Elo scores

## State Management

Consider using:

- React Context for authentication state
- Local state for UI interactions
- Custom hooks for data fetching

## Routing

- `/` - Home/Rating page
- `/login` - Authentication page
- `/upload` - Image upload page (protected)
- `/profile` - User profile page (protected)
- `/leaderboard` - Top rated images

## Testing Strategy

- Unit tests for utility functions
- Component tests for React components
- Integration tests for API interactions
