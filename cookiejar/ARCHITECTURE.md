# Architecture

## Goal

Cookiejar is a personal exercise tracker that runs on one iPhone. It is fully offline except for downloading image URLs. No accounts, no server, no network calls except for images. All data lives in a SQLite database on the device.

Core capabilities:

- Define exercises (name, body part, how it is tracked: repetitions, repetitions and weight, duration, or distance).
- Build workouts and classes, and schedule them in a weekly plan.
- Log sessions as an ordered list of exercises, each with one or more sets.
- Browse session history and see progress for an exercise over time (best set, volume, personal records).

## Non-goals

- App Store or TestFlight distribution
- Android or web builds
- Cloud sync, backups to a server, or multiple users
- Social features

## Phased Build Plan

This app is built in phases. See [docs/README.md](docs/README.md) for the full plan: each phase defines new features, where they live, and what later phases depend on.

## Tech Stack

| Concern | Choice |
| --- | --- |
| Framework | Expo SDK 57 (React Native 0.86, React 19) |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based routes in `src/app`); tabs from `expo-router/js-tabs` |
| Storage | `expo-sqlite`, one database file in the app sandbox |
| Images | `expo-image` with disk caching (used only in the `Image` primitive component) |
| Animations & gestures | `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets` |
| Haptics | `expo-haptics` for button feedback |
| Icons | `expo-symbols` for SF Symbols in tabs and buttons |
| Splash screen | `expo-splash-screen` |
| Package manager | bun |
| Test runner | `bun test` for TypeScript modules |
| Build and install | `npx expo run:ios --device` (builds through Xcode and signs with the developer's Apple ID) |

Read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before using any Expo API.

## Data Layer

- The database is opened once through `SQLiteProvider` at the root layout. Components reach it with `useSQLiteContext`.
- `PRAGMA journal_mode = WAL` and `PRAGMA foreign_keys = ON` are set on open.
- Schema changes are versioned migrations driven by `PRAGMA user_version`. Migrations run in the provider's `onInit` before any screen renders. A migration is never edited after it has shipped to the phone; new changes go in a new migration.
- Each entity has a repository module in `src/database/repositories` that holds all of its SQL. Screens and components call repository functions and never write SQL themselves.
- Every query uses bound parameters, never string interpolation.

### Exercise Repository

`src/database/repositories/exerciseRepository.ts` holds all exercise SQL. expo-sqlite can't run under bun, so it is checked on the device, not with `bun test`.

| Function | Behaviour |
| --- | --- |
| `listExercises(database)` | Every exercise, ordered by name with `NOCASE` |
| `listRecentlyUsedExercises(database, limit?)` | Every exercise, in one `LEFT JOIN` on `session_exercises.exercise_id` and `sessions`. Used exercises come first by their latest `started_at`, then the rest by `created_at` descending |
| `getExercise(database, exerciseId)` | One exercise, or `null` |
| `createExercise(database, newExercise)` | Inserts and returns the new id |
| `updateExercise(database, exerciseId, changes)` | Saves the edited fields |
| `countExerciseUsages(database, exerciseId)` | `workout_items` rows plus `session_exercises` rows that reference the exercise as `exercise_id` or `replaced_exercise_id` |
| `deleteExercise(database, exerciseId)` | Deletes the exercise. Screens only offer it when the usage count is 0 |

`createExercise` and `updateExercise` turn a `UNIQUE` violation on `name` into `DuplicateExerciseNameError`. The form also checks uniqueness (ignoring case) before saving, so the error is a safety net that shows the same message.

### Workout Repository

`src/database/repositories/workoutRepository.ts` holds all workout SQL. expo-sqlite can't run under bun, so it is checked on the device, not with `bun test`.

| Function | Behaviour |
| --- | --- |
| `listWorkouts(database)` | Every workout with exercise count, ordered by `updated_at DESC` |
| `getWorkoutWithItems(database, workoutId)` | One workout, or `null`. Loads items and their target sets in three queries and assembles them in memory |
| `saveWorkout(database, editorState)` | One `withTransactionAsync`. Inserts a new workout row or updates an existing one, setting `updated_at`. Deletes and re-inserts items and target sets (which cascades). Returns the workout id |
| `duplicateWorkout(database, workoutId)` | Copies the workout row, its items and its target sets in one transaction, named "(copy)". The copy has `updated_at` set to now so it sorts to the top |
| `deleteWorkout(database, workoutId)` | Deletes the workout |
| `countPlansUsingWorkout(database, workoutId)` | Counts `plan_entries` rows that reference the workout, for the delete warning |

### Migrations

Migrations run in order through `src/database/migrations/migrations.ts` array: `[createInitialSchema, createTrainingSchema]`. The `user_version` PRAGMA tracks which migrations have run.

- **v1 (createInitialSchema)**: Draft schema with exercises, workouts, workout_exercises and sets tables. Never edited. Kept so the migration order stays the same on every device.
- **v2 (createTrainingSchema)**: Drops draft tables and creates the full training schema for production use.

### Schema v2

| Table | Purpose | Key Columns |
| --- | --- | --- |
| **exercises** | Exercise definitions | `id`, `name` (unique), `body_part`, `default_tracking_type`, `image_url`, `created_at` |
| **workouts** | Workout templates | `id`, `name`, `kind` (individual\|class), `class_type` (yoga\|pilates\|spin\|hiking\|barre\|other), `duration_minutes`, `created_at`, `updated_at` |
| **workout_items** | Exercises in a workout template | `id`, `workout_id`, `exercise_id`, `position`, `superset_group`, `tracking_type`, `rest_seconds`, `notes` |
| **target_sets** | Target reps/weight/duration for a workout_item | `id`, `workout_item_id`, `position`, `repetitions`, `weight_kilograms`, `duration_seconds`, `distance_meters` |
| **plans** | Training plans | `id`, `name`, `is_active` (0\|1 unique), `starts_on`, `created_at` |
| **plan_entries** | Workouts scheduled in a plan | `id`, `plan_id`, `workout_id`, `day_of_week`, `time_of_day` |
| **sessions** | Started or finished workout sessions (copies workout_name/kind/class_type at time of session) | `id`, `workout_id`, `workout_name`, `workout_kind`, `class_type`, `scheduled_date`, `started_at`, `finished_at`, `health_*` fields, `notes` |
| **session_exercises** | Exercises in a session | `id`, `session_id`, `exercise_id`, `replaced_exercise_id`, `position`, `superset_group`, `tracking_type` |
| **session_sets** | Completed sets in a session | `id`, `session_exercise_id`, `position`, `target_*` columns, `repetitions`, `weight_kilograms`, `duration_seconds`, `distance_meters`, `completed_at` |
| **profile** | Single user profile (id=1) | `id`, `display_name`, `birth_date`, `sex`, `height_centimetres`, `goal`, `weekly_workout_target`, `daily_step_goal`, `updated_at` |
| **body_measurements** | Weight and body composition history | `id`, `measured_on`, `weight_kilograms`, `body_fat_percent`, waist/hip/chest measurements, `notes` |
| **health_snapshots** | Apple Health data by date | `date`, `steps`, `sleep_minutes`, `resting_heart_rate`, `fetched_at` |
| **notifications** | App notifications | `id`, `title`, `body`, `nuggie`, `route`, `created_at`, `read_at` |
| **app_settings** | Key-value settings | `key`, `value` |

### Storage Conventions

- **Timestamps**: ISO 8601 in UTC, e.g. `2026-10-04T14:30:00Z` for `started_at`, `finished_at`, `created_at`, `updated_at`.
- **Dates**: Local `YYYY-MM-DD`, e.g. `2026-10-04` for `scheduled_date`, `measured_on`, `health_snapshots.date`, `plans.starts_on`. Belongs to the user's local day, not UTC.
- **Time of day**: Local `HH:MM` 24-hour, e.g. `14:30` for `time_of_day` in plan_entries.
- **Day of week**: 1 (Monday) through 7 (Sunday).
- **Sessions copy metadata**: `workout_name`, `workout_kind`, and `class_type` are copied from the workout at session creation so history survives edits or deletes.

## Component Architecture

React components follow atomic design with four layers. A component may import from its own layer and the layers below it, never from a layer above it.

```
routes (src/app)  →  organisms  →  molecules  →  atoms  →  primitives  →  theme
```

| Layer | Responsibility | Examples |
| --- | --- | --- |
| **primitives** | Thin themed wrappers over React Native elements. The only layer that touches raw `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, `FlatList`, `SectionList`, `expo-image` and `expo-symbols`. They apply theme tokens and nothing else. | `Box`, `Typography`, `Touchable`, `TextField`, `Stack`, `Image`, `Icon`, `List`, `SectionedList`, `ScrollBox`, `AnimatedBox`, `SwipeableBox`, `LongPressDragBox`, `WindowMeasuredBox` |
| **atoms** | The smallest pieces of UI with meaning, built from primitives. No data access. | `Button`, `TextButton`, `IconButton`, `Badge`, `Chip`, `Checkbox`, `NuggieImage`, `Card`, `NumberInput`, `DurationInput`, `DragHandle`, `SupersetBracket`, `Toast` |
| **molecules** | Small groups of atoms that work as a unit. Hold local UI state at most. | `CoachFloatingButton`, `ScreenHeader`, `EmptyState`, `ChipGroup`, `SegmentedControl`, `SearchBar`, `AlphabetIndex`, `ExerciseRow`, `FormField`, `ImageUrlField`, `Stepper`, `KindChoiceCard`, `ActionCard`, `TargetSetRow`, `TargetSetTable`, `WorkoutRow` |
| **organisms** | Self-contained sections of a screen. Receive data and callbacks through props. | `NuggieLoadingScreen`, `ExerciseForm`, `ExercisePicker`, `ExerciseEditorCard`, `ReorderableExerciseList`, `ClassDetailsForm`, `CreateHub`, `WorkoutEditorFooter` |
| **routes** | Expo Router screens. Load data through repositories and hooks, then compose organisms. | `src/app/(tabs)/index.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/coach.tsx`, `src/app/exercises/*`, `src/app/workouts/*` |

Rules:

- Only routes and hooks talk to the database. Components below routes are given data through props, which keeps them easy to reuse and preview.
- Colours, spacing, radii and typography come from `src/theme` tokens. No hard-coded values in components.
- Light and dark mode are both supported through the theme.

## Exercise Library

### Routes

All four routes are registered flat in the root `Stack`. There is no `exercises/_layout.tsx`.

| Route | Presentation | Purpose |
| --- | --- | --- |
| `/exercises` | Stack push | The library. Renders `ExercisePicker` in its `browse` variant. Tapping a row opens edit, and Add in the header (or the empty state's button) opens the new form |
| `/exercises/new` | Modal | `ExerciseForm` with Save in the header. Takes an optional `requestIdentifier` (see below) |
| `/exercises/[exerciseId]` | Stack push | `ExerciseForm` for editing, plus a red Delete that asks for confirmation and is disabled with a reason when the exercise is in use |
| `/exercises/picker` | Full-screen modal, no Stack header | `ExercisePicker` in `multiple` or `single` mode. Params: `requestIdentifier`, `mode`, `excludeExerciseIds` (comma-separated) |

`ExercisePicker` is one organism for both the library and the picker, so they share one list. It has Alphabetical, Body part and Recent tabs (`SegmentedControl`), a `SearchBar` that narrows whichever tab is active, and an `AlphabetIndex` on the alphabetical lists. In `multiple` mode, the footer holds "Add exercises (n)" (needs at least 1) and "Create superset" (needs at least 2). In `single` mode there is no footer, and tapping a row returns it. Excluded exercises are disabled and show a tick.

The new and edit screens share their save flow through `useExerciseForm`. `useExercises`, `useExercise` and `useRecentlyUsedExercises` reload on focus.

### Pure Modules

These hold the library's logic, import no React Native, and are covered by `bun test`:

- `src/exercises/validateExerciseForm.ts`: name (required, trimmed, unique ignoring case), body part, tracking type and the `https` image URL rule
- `src/exercises/groupExercisesAlphabetically.ts`: A–Z sections with `#` last, and `findNearestSectionTitle` for index letters that have no section
- `src/exercises/filterExercises.ts`: search text and body part
- `src/exercises/toggleExerciseSelection.ts`: ticks and unticks while keeping tick order

### Pick Store Pattern

Expo Router can't pass a result back through `router.back()`, so screens that return a value go through `src/stores/exercisePickerStore.ts`, a small module-level store read with `useSyncExternalStore`:

1. The caller makes an identifier with `createExercisePickRequestIdentifier()`, calls `beginExercisePick(identifier)`, keeps the identifier in state, and pushes the screen with `requestIdentifier` in its params.
2. The pushed screen calls `completeExercisePick(identifier, { exerciseIds, asSuperset })` and `router.back()`. A completion for a request that wasn't begun, or was already completed, is ignored.
3. The caller reads `useExercisePickResult(identifier)`, which returns the result for one render and then consumes it. The caller copies it into its own state during render, guarded by the last result it saw, so no effect sets state.

The picker uses the same pattern in both directions. Callers open the picker with it, and the picker's `+` opens `/exercises/new` with its own request. On save, the form completes that request with the new id, and the picker appends it to the end of the selection. Opened without a `requestIdentifier`, the form just saves and goes back.

## Workout Builder

### Routes

All routes are nested under `src/app/workouts/_layout.tsx`, which wraps them in `WorkoutEditorProvider` and presents them as a modal stack from the root Stack.

| Route | Presentation | Purpose |
| --- | --- | --- |
| `/workouts/new` | Stack push (first) | Name and kind choice (Individual or Class) |
| `/workouts/class-details` | Stack push | Step 2 for class workouts: class type, duration, description, image URL |
| `/workouts/editor` | Stack push | Step 2 for individual workouts: exercise picker on open (if `pickOnOpen`), then exercise editor with target sets, superset grouping, and drag to reorder |
| `/workouts/[workoutId]/edit` | Modal | Loads an existing workout into the editor or the class form after `loaded` |
| `/workouts/superset-info` | Form sheet | Info about supersets with the `coach` nuggie and a tip |

### Builder Modal Stack and Editor Context

`src/app/workouts/_layout.tsx` nests a `Stack` inside `WorkoutEditorProvider`, so all builder screens share one editor state through the context. The state is never passed through route params.

`WorkoutEditorProvider` (in `src/workouts/WorkoutEditorProvider.tsx`) wraps `useReducer(workoutEditorReducer)` and exposes the context via `useWorkoutEditor()` hook.

### Editor State and Reducer

`src/workouts/workoutEditorReducer.ts` is pure with no React Native imports and is tested. It is built by `createWorkoutEditorReducer(createKey)`, a factory that injects a key counter for deterministic test fixtures.

The `WorkoutEditorState` shape holds `workoutId` (null for new), `name`, `kind` (individual or class), `classDetails` (only for class), `items` (exercises with tracking type, rest time, superset group and target sets), and `hasUnsavedChanges`.

The actions are `renamed`, `kindChosen`, `classDetailsChanged`, `exercisesAdded`, `itemRemoved`, `supersetCreated`, `supersetRemoved`, `exerciseReplaced`, `restChanged`, `trackingTypeChanged`, `targetSetAdded`, `targetSetRemoved`, `targetSetChanged`, `itemsReordered` (takes block keys), and `loaded`.

After every action, `normaliseSupersets` reletters groups A, B, C… from top to bottom and clears any group with a single member.

### Superset Blocks and Drag

Exercises are grouped into superset blocks by `groupIntoBlocks` (in `src/workouts/groupIntoBlocks.ts`) before rendering, so drag reorder sees and reorders whole blocks. When a drop happens, `applyBlockOrder` updates the item positions.

Drag to reorder is implemented in the custom `ReorderableExerciseList` organism (in `src/components/organisms/ReorderableExerciseList.tsx`), built from `react-native-gesture-handler` and `react-native-reanimated` with the `LongPressDragBox` primitive. `react-native-draggable-flatlist` was not installed because it has no stable release for Reanimated 4.

### Unsaved Changes Guard and Save Flow

`useUnsavedChangesGuard(hasUnsavedChanges)` uses `expo-router/react-navigation`'s `usePreventRemove` to ask "Discard changes?" when leaving with unsaved changes. It is active on every builder screen but only prevents on the first route of the stack, so stepping back between builder steps does not ask.

`useSaveWorkout()` is called by Save and Discard buttons; it runs `saveWorkout(database, editorState)` through the repository, catches errors, closes the modal with `router.back()`, and sets `leaveWithoutPrompt` context to bypass the guard on the way out.

### Saved Notice Store and Toast

When a workout is saved, the route calls `announceWorkoutSaved(workoutName)` into `src/stores/workoutSavedStore.ts`. The store is consumed once by `useWorkoutSavedNoticeOnFocus()` on the Create hub, which reads `consumeWorkoutSavedNotice()` on focus and shows a `Toast` atom with the message "Saved <name>".

### Picker Reuse

The exercise picker is opened from inside the builder by calling `beginExercisePick()` into the existing `exercisePickerStore`, then pushing `/exercises/picker` with `mode: 'multiple'` (for Add exercises) or `mode: 'single'` (for Replace). The picker pushes back with results to the same store, so the builder gets them through `useExercisePickResult()`.

### Pure Modules

These hold the builder's logic, import no React Native, and are covered by `bun test`:

- `src/workouts/workoutEditorReducer.ts`: all actions with deterministic keys
- `src/workouts/normaliseSupersets.ts`: relettering groups and clearing single members
- `src/workouts/groupIntoBlocks.ts`: grouping items into superset blocks and applying block-key order back
- `src/workouts/targetSetColumns.ts`: columns and input rules by tracking type, empty values for each type
- `src/workouts/workoutSaveRows.ts`: mapping from editor state to database rows (positions, superset letters, class vs individual fields)
- `src/workouts/supersetCardPositions.ts`: Y-coordinates of superset cards for scroll-to-offset during drag
- `src/workouts/reorderDrag.ts`: slot and scroll maths for the custom sortable list
- `src/workouts/restPresets.ts`: preset rest times and formatting
- `src/workouts/classTypeNuggie.ts`: nuggie choice for each class type
- `src/numbers/numberText.ts`: parsing rules for number inputs (kg one decimal, distance in km)
- `src/images/imageUrls.ts`: image URL validation and error (shared with exercise form)

## App Start

When the app launches:

1. The native splash screen stays up because the root layout calls `SplashScreen.preventAutoHideAsync()` at module scope.
2. `NuggieLoadingScreen` appears as an overlay (sky-blue background, 180-point centred nuggie image, caption) and hides the native splash on its first layout. The nuggie is chosen by `chooseNuggie({ kind: 'appLoading' }, new Date())` to match the hour of day (sleeping 22–04, early morning 05–07, workout 08–21).
3. The `SQLiteProvider` (with `useSuspense`) runs its `onInit` function: migrations execute against the database, driven by `PRAGMA user_version`.
4. Once the database is ready and the minimum 800ms has elapsed, the loading screen hides and the tab navigation appears.
5. Four tabs occupy the bottom: Home, Calendar, Create, Profile. The `CoachFloatingButton` (64-point circle with a 3-point accent ring) floats in the bottom-right, 16 points from each edge, above the tab bar. Tapping it opens the coach modal.

The root layout nests `ThemeProvider` → `Suspense` (null fallback) → `SQLiteProvider` → `GestureHandlerRootView` → `Stack`. The loading screen is a sibling overlay inside `ThemeProvider`, so the tabs mount underneath while it is still showing.

## Directory Layout

```
src/
  app/                      Expo Router routes and layouts
    (tabs)/                 bottom tabs: index, calendar, create, profile
    _layout.tsx             root: ThemeProvider → Suspense → SQLiteProvider → GestureHandlerRootView → Stack
    coach.tsx               Coach modal screen
    exercises/              library (index), new, [exerciseId] edit, picker
    workouts/               builder: _layout with WorkoutEditorProvider, new, class-details, editor, [workoutId]/edit, superset-info
  components/
    primitives/             themed wrappers: Box, Typography, Touchable, TextField, Stack, Image, Icon, List, SectionedList, ScrollBox, AnimatedBox, SwipeableBox, LongPressDragBox, WindowMeasuredBox
    atoms/                  smallest UI pieces: Button, TextButton, IconButton, Badge, Chip, Checkbox, NuggieImage, Card, NumberInput, DurationInput, DragHandle, SupersetBracket, Toast
    molecules/              small grouped atoms: CoachFloatingButton, ScreenHeader, EmptyState, ChipGroup, SegmentedControl, SearchBar, AlphabetIndex, ExerciseRow, FormField, ImageUrlField, Stepper, KindChoiceCard, ActionCard, TargetSetRow, TargetSetTable, WorkoutRow
    organisms/              self-contained sections: NuggieLoadingScreen, ExerciseForm, ExercisePicker, ExerciseEditorCard, ReorderableExerciseList, ClassDetailsForm, CreateHub, WorkoutEditorFooter
  database/
    migrations/             schema: createInitialSchema (v1 draft, unedited), createTrainingSchema (v2)
    repositories/           one file per entity: exerciseRepository, workoutRepository
  exercises/                pure exercise logic with tests: validation, A–Z grouping, filtering, selection
  hooks/                    data hooks that reload on focus: useExercises, useExercise, useRecentlyUsedExercises, useExerciseForm, useWorkouts, useWorkoutWithItems, useWorkoutEditor, useWorkoutActions, useExercisePicks, useSaveWorkout, useUnsavedChangesGuard, useWorkoutSavedNoticeOnFocus
  stores/                   exercisePickerStore and workoutSavedStore for returning values between screens, with tests
  workouts/                 pure builder logic with tests: reducer, normalisation, grouping blocks, target set columns, save rows, drag maths, rest presets, class type nuggies, editor context and provider
  numbers/                  pure number parsing with tests: textual input rules
  images/                   pure image URL validation with tests: error messages
  nuggies/                  nuggie selection and image system
  dates/                    pure date/duration helpers with tests
  types/                    shared domain types (Exercise, Workout, Session, etc.)
  theme/                    design tokens and theme provider
  health/                   Apple Health integration (phase 06)
  coach/                    Coach logic and screens (phase 09)
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
