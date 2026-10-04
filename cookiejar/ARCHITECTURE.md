# Architecture

## Goal

Cookiejar is a personal exercise tracker that runs on one iPhone. It is fully offline: no accounts, no server, no network calls. All data lives in a SQLite database on the device.

Core capabilities:

- Define exercises (name, category, how it is measured: reps and weight, duration, or distance).
- Log a workout as an ordered list of exercises, each with one or more sets.
- Browse workout history.
- See progress for an exercise over time (best set, volume, personal records).

## Non-goals

- App Store or TestFlight distribution
- Android or web builds
- Cloud sync, backups to a server, or multiple users
- Social features

## Tech Stack

| Concern | Choice |
| --- | --- |
| Framework | Expo SDK 57 (React Native 0.86, React 19) |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based routes in `src/app`) |
| Storage | `expo-sqlite`, one database file in the app sandbox |
| Package manager | bun |
| Build and install | `npx expo run:ios --device` (builds through Xcode and signs with the developer's Apple ID) |

Read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before using any Expo API.

## Data Layer

- The database is opened once through `SQLiteProvider` at the root layout. Components reach it with `useSQLiteContext`.
- `PRAGMA journal_mode = WAL` is set on open.
- Schema changes are versioned migrations driven by `PRAGMA user_version`. Migrations run in the provider's `onInit` before any screen renders. A migration is never edited after it has shipped to the phone; new changes go in a new migration.
- Each entity has a repository module in `src/database/repositories` that holds all of its SQL. Screens and components call repository functions and never write SQL themselves.
- Every query uses bound parameters, never string interpolation.

### Initial Schema (draft)

```
exercises
  id                integer primary key
  name              text not null unique
  category          text not null
  measurement_type  text not null   -- repetitions_and_weight | duration | distance
  created_at        text not null

workouts
  id                integer primary key
  started_at        text not null
  finished_at       text
  notes             text

workout_exercises
  id                integer primary key
  workout_id        integer not null references workouts(id) on delete cascade
  exercise_id       integer not null references exercises(id)
  position          integer not null

sets
  id                    integer primary key
  workout_exercise_id   integer not null references workout_exercises(id) on delete cascade
  position              integer not null
  repetitions           integer
  weight_kilograms      real
  duration_seconds      integer
  distance_meters       real
  completed_at          text
```

Timestamps are stored as ISO 8601 strings in UTC.

## Component Architecture

React components follow atomic design with four layers. A component may import from its own layer and the layers below it, never from a layer above it.

```
routes (src/app)  →  organisms  →  molecules  →  atoms  →  primitives  →  theme
```

| Layer | Responsibility | Examples |
| --- | --- | --- |
| **primitives** | Thin themed wrappers over React Native elements. The only layer that touches raw `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`. They apply theme tokens and nothing else. | `Box`, `Typography`, `Touchable`, `TextField`, `Stack` |
| **atoms** | The smallest pieces of UI with meaning, built from primitives. No data access. | `Button`, `Input`, `Label`, `Icon`, `Badge`, `Divider` |
| **molecules** | Small groups of atoms that work as a unit. Hold local UI state at most. | `FormField`, `SetRow`, `StatTile`, `ExerciseListItem`, `SearchBar` |
| **organisms** | Self-contained sections of a screen. Receive data and callbacks through props. | `WorkoutLogger`, `ExerciseList`, `WorkoutHistoryList`, `ProgressChart` |
| **routes** | Expo Router screens. Load data through repositories and hooks, then compose organisms. | `src/app/index.tsx`, `src/app/workouts/[workoutId].tsx` |

Rules:

- Only routes and hooks talk to the database. Components below routes are given data through props, which keeps them easy to reuse and preview.
- Colours, spacing, radii and typography come from `src/theme` tokens. No hard-coded values in components.
- Light and dark mode are both supported through the theme.

## Directory Layout

```
src/
  app/                      Expo Router routes and layouts
  components/
    primitives/
    atoms/
    molecules/
    organisms/
  database/
    migrations/             one file per schema version
    repositories/           one file per entity
  hooks/                    data and behaviour hooks used by routes
  theme/                    design tokens and theme provider
  types/                    shared domain types
```

## Conventions

- No comments in code.
- No abbreviated names. Names must make the code readable on their own (`workoutExercise`, not `wex`; `index`, not `i`).
- One component per file, with the file named after the component.
- No co-authored commits.

## Deployment to the iPhone

1. Install Xcode and sign in with an Apple ID (Xcode → Settings → Accounts).
2. Connect the iPhone by USB and run `npx expo run:ios --device`.
3. On the first install, enable Developer Mode (Settings → Privacy & Security → Developer Mode) and trust the developer certificate (Settings → General → VPN & Device Management).
4. With a free Apple ID, the build expires after 7 days. Re-run step 2 to refresh it. With the paid Apple Developer Program, builds last one year.
5. Installing over the existing app keeps the SQLite database. Deleting the app from the phone deletes all data.
