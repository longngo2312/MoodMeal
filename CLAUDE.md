# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MoodMeal** is a full-stack health tracking app for logging meals, symptoms, and moods, with AI-powered recommendations via Claude. It consists of:
- **Frontend**: React Native + Expo (cross-platform mobile/web)
- **Backend**: Express.js REST API with Prisma ORM + SQLite

## Commands

### Frontend (root directory)
```bash
npm start               # Start Expo dev server
npm run android         # Run on Android emulator
npm run ios             # Run on iOS simulator
npm run web             # Start web version
npx tsc --noEmit        # TypeScript type check
npx expo export --platform web  # Build web
```

### Backend (`backend/` directory)
```bash
npm run dev             # Start dev server with hot reload (ts-node-dev)
npm run build           # Compile TypeScript to dist/
npm start               # Run compiled JS
npx tsc --noEmit        # TypeScript type check
```

### Database (run in `backend/`)
```bash
npm run db:migrate      # Run Prisma migrations
npm run db:push         # Push schema changes without migration
npm run db:seed         # Seed the database
npm run db:studio       # Open Prisma Studio GUI
npx prisma generate     # Regenerate Prisma client after schema changes
```

### CI (what GitHub Actions runs)
1. `npx tsc --noEmit` — frontend type check
2. `cd backend && npm ci && npx prisma generate && npx tsc --noEmit && npm run build` — backend check
3. `npx expo-doctor && npx expo export --platform web` — frontend build

## Architecture

### Navigation Flow
```
App (ThemeProvider → AuthProvider → AppNavigator)
├── Unauthenticated → AuthScreen
├── Authenticated, no profile → OnboardingScreen
└── Authenticated & onboarded → TabNavigator (Dashboard, Insights, Calendar, Settings)
    └── Stack modals: MealForm, SymptomForm, MoodForm, Recommendations, Profile
```

### Frontend Structure (`src/`)
- **`contexts/`** — `AuthContext` (user session, login/logout) and `ThemeContext`
- **`hooks/`** — Custom data hooks (`useMeals`, `useSymptoms`, `useMoods`, `useProfile`, `useCalendarData`) that call the API and manage local state
- **`services/api.ts`** — Central API client; reads `EXPO_PUBLIC_API_URL`, attaches JWT from AsyncStorage, handles network errors
- **`components/ui/`** — Reusable UI primitives (Button, Card, TextInputField, TagList, etc.)
- **`types/`** — Shared TypeScript interfaces (User, Meal, Symptom, Mood, DayData, etc.)
- **`theme/`** — Color tokens and theming
- **`utils/`** — `dateUtils`, `networkUtils`, `severityUtils`
- **Path alias**: `@/*` maps to `src/*`

### Backend Structure (`backend/src/`)
- **`index.ts`** — Express app entry point, route mounting, middleware
- **`routes/`** — One file per resource: `auth`, `profiles`, `meals`, `symptoms`, `moods`, `recommendations`
- **`middleware/`** — JWT auth middleware (protects all `/api/*` except `/api/auth`)
- **`config/`** — `env.ts` (typed env vars via Zod), `database.ts` (Prisma client singleton)
- **`utils/`** — JWT helpers, validation utilities

### API Endpoints
| Prefix | Purpose |
|--------|---------|
| `GET /api/health` | Health check |
| `/api/auth/*` | Login, signup, logout |
| `/api/profiles/*` | User profile CRUD |
| `/api/meals/*` | Meal logging CRUD |
| `/api/symptoms/*` | Symptom tracking CRUD |
| `/api/moods/*` | Mood logging CRUD |
| `/api/recommendations/*` | AI recommendations (calls `@anthropic-ai/sdk`) |

### Database Schema (Prisma + SQLite)
Models: `User`, `Profile`, `Meal`, `Symptom`, `Mood`. All use UUID primary keys with `createdAt`/`updatedAt` timestamps. Cascade deletes are configured on all relations from User.

### Environment Variables
- **Frontend** (`.env`): `EXPO_PUBLIC_API_URL` — base URL for the backend API
- **Backend** (`.env`): `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `NODE_ENV`

### CI/CD
GitHub Actions (`.github/workflows/ci.yml`) runs on push to `main`/`develop` and PRs to `main`. On merge to `main`, it deploys via `eas update --auto` using the `EXPO_TOKEN` secret.
