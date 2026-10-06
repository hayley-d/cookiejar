# Architecture

## Goal

Nuggie's Gym is a personal exercise tracker that runs on one iPhone. It is fully offline except for downloading image URLs. No accounts, no server, no network calls except for images. All data lives in a SQLite database on the device.

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
| SVG | `react-native-svg` for the progress ring in the class session view and the steps stat tile (used only in the `ProgressRingBox` primitive) |
| Charts | `victory-native` (`^42.0.1`, resolved at 42.0.1) drawing with `@shopify/react-native-skia` (`2.6.2`). Both are imported only by `ProgressChartFrame`, `ProgressLineChart` and `ProgressBarChart` |
| Date/time picker | `@react-native-community/datetimepicker` (native platform pickers for time and date selection) |
| Apple Health | `@kingstinct/react-native-healthkit`, pinned exactly at `15.1.0`, with `react-native-nitro-modules` (`0.37.1`) as its native bridge |
| Splash screen | `expo-splash-screen` |
| Package manager | bun. `package.json` lists `@shopify/react-native-skia` under `trustedDependencies` so bun runs its install script |
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
| `countPlansUsingWorkout(database, workoutId)` | Counts the distinct plans that reference the workout in their `plan_entries`, for the delete warning |

### App Settings Repository

`src/database/repositories/appSettingsRepository.ts` holds key-value settings:

| Function | Behaviour |
| --- | --- |
| `getSetting(database, key)` | Returns the setting value string, or `null` |
| `setSetting(database, key, value)` | Inserts or updates the setting value |

Keys live in constants next to their feature: `healthAuthorizationRequestedAtSettingKey` in `src/health/healthSettingKeys.ts` and `coachTipLastShownDateSettingKey` (`coach_tip_last_shown_date`) in `src/coach/coachSettingKeys.ts`.

### Health Snapshot Repository

`src/database/repositories/healthSnapshotRepository.ts` holds Apple Health snapshots by date:

| Function | Behaviour |
| --- | --- |
| `getHealthSnapshot(database, date)` | One snapshot (date string `YYYY-MM-DD`), or `null` |
| `getHealthSnapshotsBetween(database, startDate, endDate)` | Snapshots for a date range (inclusive), ordered by date |
| `upsertHealthSnapshot(database, dailyHealth)` | Inserts or updates a snapshot with `steps`, `sleepMinutes`, `restingHeartRate` and `fetchedAt` |

### Profile Repository

`src/database/repositories/profileRepository.ts` holds the profile SQL. The `profile` table holds one row with `id = 1`. expo-sqlite can't run under bun, so it is checked on the device, not with `bun test`.

| Function | Behaviour |
| --- | --- |
| `getProfile(database)` | The profile row mapped to a `Profile` (`id`, `displayName`, `birthDate`, `sex`, `heightCentimetres`, `goal`, `weeklyWorkoutTarget`, `dailyStepGoal`, `updatedAt`), or `null` when the row is missing. It reads with a bound `id` parameter |
| `updateProfile(database, profileUpdate)` | Phase 08. Updates `display_name`, `birth_date`, `sex`, `height_centimetres`, `goal`, `weekly_workout_target` and `daily_step_goal` of the `id = 1` row and sets `updated_at` to now, with bound parameters. `ProfileUpdate` comes from `src/profile/validateProfileForm.ts` |

The profile form (see Profile and Progress) is the only writer.

`useProfile()` (in `src/hooks/useProfile.ts`) returns a `ProfileState`: every `Profile` field plus `isLoaded` and `hasLoadFailed`. It starts from the defaults `displayName: null`, `birthDate: null`, `sex: null`, `heightCentimetres: null`, `goal: null`, `dailyStepGoal: 10000` and `weeklyWorkoutTarget: 4` with `isLoaded: false`, and keeps them when the row is missing. A failed read sets `hasLoadFailed` and keeps the previous state. It reloads on focus (not the first one, through `useFocusReloadKey`) and when `dataVersion` changes.

### Body Measurement Repository

`src/database/repositories/bodyMeasurementRepository.ts` holds the `body_measurements` SQL (Phase 08). Checked on the device, not with `bun test`.

| Function | Behaviour |
| --- | --- |
| `listBodyMeasurements(database)` | Every measurement as a `BodyMeasurement`, ordered by `measured_on DESC, id DESC` |
| `addBodyMeasurement(database, input)` | Inserts a `BodyMeasurementInput` and returns the new id |
| `deleteBodyMeasurement(database, bodyMeasurementId)` | Deletes one measurement |
| `getLatestBodyMeasurement(database)` | The newest measurement (same order), or `null` |
| `listWeightsBetween(database, startDate, endDate)` | `WeightMeasurement` rows (`measuredOn`, `weightKilograms`) with a weight, inclusive of both dates, ordered by `measured_on ASC, id ASC` |

### Notification Repository

`src/database/repositories/notificationRepository.ts` holds the `notifications` SQL (Phase 09b). A row is written when its notification is scheduled, with `created_at` set to the fire time, so only rows whose `created_at` is in the past have been delivered. Checked on the device, not with `bun test`.

| Function | Behaviour |
| --- | --- |
| `upsertNotification(database, recordedNotification)` | Inserts or updates the row with the same `identifier`, and clears `read_at` |
| `deleteFutureNotificationsWithIdentifierPrefix(database, identifierPrefix, now)` | Deletes rows whose identifier starts with the prefix and whose `created_at` is after `now` |
| `listPastNotifications(database, now)` | Rows with `created_at` at or before `now` as `AppNotification`, newest first |
| `countPastUnreadNotifications(database, now)` | The number of past rows with no `read_at` |
| `markNotificationRead(database, notificationId, now)` | Sets `read_at` on one row by id |
| `markNotificationReadByIdentifier(database, identifier, now)` | Sets `read_at` on one row by identifier |
| `markAllNotificationsRead(database, now)` | Sets `read_at` on every past unread row |

### Progress Repository

`src/database/repositories/progressRepository.ts` holds the read-only SQL behind the Progress screens (Phase 08). Only finished sessions (`finished_at IS NOT NULL`) and completed sets (`completed_at IS NOT NULL`) count. Checked on the device, not with `bun test`.

| Function | Behaviour |
| --- | --- |
| `getTrainingTotals(database, startDate, endDate)` | `TrainingTotals` (`workoutCount`, `timeTrainedSeconds`, `volumeKilograms`) for sessions whose `started_at` falls in the range. A `null` start date means from the beginning. Time trained is the sum of `finished_at - started_at`, classes included. Volume is the sum of weight times repetitions over `repetitions_and_weight` sets |
| `listAllFinishedSessionSets(database)` | Every completed set of every finished session as a `FinishedSessionSet`, in session, exercise and set order. Feeds the records list |
| `listFinishedSessionSetsForExercise(database, exerciseId)` | The same rows for one exercise, as `ExerciseHistorySet`. Feeds the exercise history |
| `listExercisesWithHistory(database)` | `ExerciseWithHistory` for each exercise that has a completed set in a finished session, newest `lastPerformedAt` first, then by name |
| `listClassStatistics(database, monthRange)` | `ClassStatistics` per class type (`sessionCount`, `totalSeconds`, `sessionsThisMonth`, `lastStartedAt`) from finished class sessions, ordered by `sortClassStatistics` |

### Migrations

Migrations run in order through `src/database/migrations/migrations.ts` array: `[createInitialSchema, createTrainingSchema, addSessionExerciseRestSeconds, addNotificationIdentifier]`. The `user_version` PRAGMA tracks which migrations have run.

- **v1 (createInitialSchema)**: Draft schema with exercises, workouts, workout_exercises and sets tables. Never edited. Kept so the migration order stays the same on every device.
- **v2 (createTrainingSchema)**: Drops draft tables and creates the full training schema for production use.
- **v3 (addSessionExerciseRestSeconds)**: Adds `rest_seconds` column to `session_exercises` table to allow per-session rest customization.
- **v4 (addNotificationIdentifier)**: Adds a nullable `identifier` column to `notifications` and the unique index `notifications_by_identifier` on it. SQLite can't add a `UNIQUE` column with `ALTER TABLE`, so the uniqueness comes from the index.

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
| **session_exercises** | Exercises in a session | `id`, `session_id`, `exercise_id`, `replaced_exercise_id`, `position`, `superset_group`, `tracking_type`, `rest_seconds` (added by v3) |
| **session_sets** | Completed sets in a session | `id`, `session_exercise_id`, `position`, `target_*` columns, `repetitions`, `weight_kilograms`, `duration_seconds`, `distance_meters`, `completed_at` |
| **profile** | Single user profile (id=1) | `id`, `display_name`, `birth_date`, `sex`, `height_centimetres`, `goal`, `weekly_workout_target`, `daily_step_goal`, `updated_at` |
| **body_measurements** | Weight and body composition history | `id`, `measured_on`, `weight_kilograms`, `body_fat_percent`, waist/hip/chest measurements, `notes` |
| **health_snapshots** | Apple Health data by date | `date`, `steps`, `sleep_minutes`, `resting_heart_rate`, `fetched_at` |
| **notifications** | App notifications | `id`, `identifier` (unique, added by v4), `title`, `body`, `nuggie`, `route`, `created_at`, `read_at` |
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
| **primitives** | Thin themed wrappers over React Native elements. The only layer that touches raw `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, `FlatList`, `SectionList`, `expo-image`, `expo-symbols`, `react-native-svg` and `@react-native-community/datetimepicker`. They apply theme tokens and nothing else. | `Box`, `Typography`, `Touchable`, `TextField`, `Stack`, `Image`, `Icon`, `List`, `SectionedList`, `ScrollBox`, `AnimatedBox`, `SwipeableBox`, `LongPressDragBox`, `WindowMeasuredBox`, `TimePickerBox`, `ProgressRingBox`, `ShakeBox`, `SnapList`, `PulseBox` |
| **atoms** | The smallest pieces of UI with meaning, built from primitives. No data access. | `Button`, `TextButton`, `IconButton`, `Badge`, `Chip`, `Checkbox`, `NuggieImage`, `Card`, `NumberInput`, `DurationInput`, `DragHandle`, `SupersetBracket`, `Toast`, `TimeLabel`, `StatusChip`, `DayMarker`, `CountdownButton`, `ElapsedTimer`, `PageDots`, `StreakDots`, `TrendArrow`, `DatePickerField`, `TypingIndicator` |
| **molecules** | Small groups of atoms that work as a unit. Hold local UI state at most. | `CoachFloatingButton`, `ScreenHeader`, `EmptyState`, `ChipGroup`, `SegmentedControl`, `SearchBar`, `AlphabetIndex`, `ExerciseRow`, `FormField`, `ImageUrlField`, `Stepper`, `KindChoiceCard`, `ActionCard`, `TargetSetRow`, `TargetSetTable`, `WorkoutRow`, `WorkoutNameField`, `PlanEntryRow`, `DaySectionHeader`, `PlanRow`, `RestDay`, `ActivePlanBanner`, `DayChip`, `ScheduledWorkoutCard`, `HeaderImageCard`, `WorkoutDetailExerciseRow`, `ActiveSessionBanner`, `PersonalRecordRow`, `RestTimerBar`, `SessionSetRow`, `SessionTopBar`, `StatTile`, `GreetingHeader`, `TodayWorkoutCard`, `NuggieActionCard`, `RestDayCard`, `NoPlanCard`, `WeeklyStreakTile`, `StatBarRow`, `ProfileSummaryHeader`, `SettingsRow`, `MeasurementRow`, `RangeSwitcher`, `ClassCountTile`, `StatisticLine`, `CoachMessageBubble`, `UserMessageBubble`, `PromptChip` |
| **organisms** | Self-contained sections of a screen. Receive data and callbacks through props. | `NuggieLoadingScreen`, `ExerciseForm`, `ExercisePicker`, `ExerciseEditorCard`, `ReorderableExerciseList`, `ClassDetailsForm`, `CreateHub`, `WorkoutEditorFooter`, `PlanWeekEditor`, `AddPlanEntrySheet`, `ActivatePlanSheet`, `EntryTimeSheet`, `CopyDaySheet`, `WeekStrip`, `DayWorkoutList`, `IndividualWorkoutDetail`, `ClassWorkoutDetail`, `SessionLogger`, `ClassSessionView`, `SessionExerciseCard`, `SessionSummary`, `TodayCarousel`, `StatTileGrid`, `StatBarList`, `HealthMetricBarList`, `StreakBarList`, `ProfileForm`, `MeasurementForm`, `ProgressOverview`, `RecentRecordsSection`, `PersonalRecordItemRow`, `ClassCountSection`, `ClassStatisticsCard`, `ExerciseProgressSection`, `ExerciseHistoryList`, `ProgressChartFrame`, `ProgressLineChart`, `ProgressBarChart`, `CoachConversation`, `PromptChipBar` |
| **routes** | Expo Router screens. Load data through repositories and hooks, then compose organisms. | `src/app/(tabs)/index.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/coach.tsx`, `src/app/exercises/*`, `src/app/workouts/*`, `src/app/plans/*`, `src/app/workout/[workoutId].tsx`, `src/app/sessions/[sessionId]/index.tsx`, `src/app/sessions/[sessionId]/finishing.tsx`, `src/app/sessions/[sessionId]/summary.tsx`, `src/app/stats/[metric].tsx`, `src/app/(tabs)/profile.tsx`, `src/app/profile/*`, `src/app/progress/*` |

Rules:

- Only routes and hooks talk to the database. Components below routes are given data through props, which keeps them easy to reuse and preview.
- Colours, spacing, radii, sizes, durations and typography come from `src/theme` tokens. No hard-coded values in components. Fixed dimensions (image and icon sizes, column widths, clearances, drag geometry) live in `theme.sizes`.
- Light and dark mode are both supported through the theme.

## Exercise Library

### Routes

All four routes are registered flat in the root `Stack`. There is no `exercises/_layout.tsx`.

| Route | Presentation | Purpose |
| --- | --- | --- |
| `/exercises` | Stack push | The library. Renders `ExercisePicker` in its `browse` variant. Tapping a row opens edit, and Add in the header (or the empty state's button) opens the new form. Takes an optional `bodyPart` param (see below) |
| `/exercises/new` | Modal | `ExerciseForm` with Save in the header. Takes an optional `requestIdentifier` (see below) |
| `/exercises/[exerciseId]` | Stack push | `ExerciseForm` for editing, plus a red Delete that asks for confirmation and is disabled with a reason when the exercise is in use |
| `/exercises/picker` | Full-screen modal, no Stack header | `ExercisePicker` in `multiple` or `single` mode. Params: `requestIdentifier`, `mode`, `excludeExerciseIds` (comma-separated) |

`ExercisePicker` is one organism for both the library and the picker, so they share one list. It has Alphabetical, Body part and Recent tabs (`SegmentedControl`), a `SearchBar` that narrows whichever tab is active, and an `AlphabetIndex` on the alphabetical lists. In `multiple` mode, the footer holds "Add exercises (n)" (needs at least 1) and "Create superset" (needs at least 2). In `single` mode there is no footer, and tapping a row returns it. Excluded exercises are disabled and show a tick.

The library route takes an optional `bodyPart` param (Phase 09a, used by the coach's `muscleBalance` action). `parseBodyPartParameter` turns it into a `BodyPart`, or `null` when it is missing, repeated or not a known body part. With a body part, the route filters both the alphabetical and the recent lists through `filterExercises` and shows a selected `Chip` ("{body part} ✕") above the list; tapping it calls `router.setParams({ bodyPart: undefined })` to clear the filter. Without the param the library is unchanged.

The new and edit screens share their save flow through `useExerciseForm`. `useExercises`, `useExercise` and `useRecentlyUsedExercises` reload on focus.

### Pure Modules

These hold the library's logic, import no React Native, and are covered by `bun test`:

- `src/exercises/validateExerciseForm.ts`: name (required, trimmed, unique ignoring case), body part, tracking type and the `https` image URL rule
- `src/exercises/groupExercisesAlphabetically.ts`: A–Z sections with `#` last, and `findNearestSectionTitle` for index letters that have no section
- `src/exercises/filterExercises.ts`: search text and body part
- `src/exercises/toggleExerciseSelection.ts`: ticks and unticks while keeping tick order
- `src/exercises/parseBodyPartParameter.ts`: the `bodyPart` route param to a `BodyPart` or `null`

### Pick Store Pattern

Expo Router can't pass a result back through `router.back()`, so screens that return a value go through `src/stores/exercisePickerStore.ts`, a small module-level store read with `useSyncExternalStore`:

1. The caller makes an identifier with `createExercisePickRequestIdentifier()`, calls `beginExercisePick(identifier)`, keeps the identifier in state, and pushes the screen with `requestIdentifier` in its params.
2. The pushed screen calls `completeExercisePick(identifier, { exerciseIds, asSuperset })` and `router.back()`. A completion for a request that wasn't begun, or was already completed, is ignored.
3. The caller reads `useExercisePickResult(identifier)`, which returns the result for one render and then consumes it. The caller copies it into its own state during render, guarded by the last result it saw, so no effect sets state.

The picker uses the same pattern in both directions. Callers open the picker with it, and the picker's `+` opens `/exercises/new` with its own request. On save, the form completes that request with the new id, and the picker appends it to the end of the selection. Opened without a `requestIdentifier`, the form just saves and goes back.

## Workout Builder

### Routes

All routes are nested under `src/app/workouts/_layout.tsx`, which wraps them in `WorkoutEditorProvider`. The entire `workouts` group is presented as a modal from the root Stack. Within the builder Stack:

| Route | Presentation | Purpose |
| --- | --- | --- |
| `/workouts/new` | Stack push (first) | Name and kind choice (Individual or Class) |
| `/workouts/class-details` | Stack push | Step 2 for class workouts: class type, duration, description, image URL |
| `/workouts/editor` | Stack push | Step 2 for individual workouts: exercise picker on open (if `pickOnOpen`), then exercise editor with target sets, superset grouping, and drag to reorder |
| `/workouts/[workoutId]/edit` | Stack push (first, no anchor) | Loads an existing workout into the editor or the class form after `loaded`. Both show a Name field at the top (only when `workoutId` is set), so a saved workout or a duplicate can be renamed; Save is disabled and the error shows inline while the name is empty. It is pushed from the Create hub without `withAnchor`, and `workouts/_layout.tsx` sets no `unstable_settings.anchor`, so the builder stack opens as `[edit]` and never stacks it on `new` |
| `/workouts/superset-info` | Form sheet | Info about supersets with the `coach` nuggie and a tip |

### Builder Modal Stack and Editor Context

`src/app/workouts/_layout.tsx` nests a `Stack` inside `WorkoutEditorProvider`, so all builder screens share one editor state through the context. The state is never passed through route params.

`WorkoutEditorProvider` (in `src/workouts/WorkoutEditorProvider.tsx`) wraps `useReducer(workoutEditorReducer)` and exposes the context via `useWorkoutEditor()` hook. The context also holds `isLeavingPermitted` and `leaveWithoutPrompt` (see the guard below) and `isReordering` with `setIsReordering`, which the editor sets while a block is being dragged.

### Editor State and Reducer

`src/workouts/workoutEditorReducer.ts` is pure with no React Native imports and is tested. It is built by `createWorkoutEditorReducer(createKey)`, a factory that injects the key function. Production (`WorkoutEditorProvider`) and the tests both pass `createKeyCounter(prefix)`, which keeps keys deterministic in the tests.

The `WorkoutEditorState` shape holds `workoutId` (null for new), `name`, `kind` (individual or class), `classDetails` (only for class), `items` (exercises with tracking type, rest time, superset group and target sets), and `hasUnsavedChanges`.

The actions are `renamed`, `kindChosen`, `classDetailsChanged`, `exercisesAdded`, `itemRemoved`, `supersetCreated`, `supersetRemoved`, `exerciseReplaced`, `restChanged`, `trackingTypeChanged`, `targetSetAdded`, `targetSetRemoved`, `targetSetChanged`, `itemsReordered` (takes block keys), and `loaded`.

Actions that would change nothing return the same state, so they never mark it unsaved: an empty `exercisesAdded`, `itemRemoved` with an unknown key, `exerciseReplaced` with the same exercise or an unknown key, an unchanged `restChanged` or `itemsReordered`, and superset actions that do not apply. After every other action, `normaliseSupersets` reletters groups A, B, C… from top to bottom and clears any group with a single member.

### Superset Blocks and Drag

Exercises are grouped into superset blocks by `groupIntoBlocks` (in `src/workouts/groupIntoBlocks.ts`) before rendering, so drag reorder sees and reorders whole blocks. When a drop happens, `applyBlockOrder` updates the item positions.

Drag to reorder is implemented in the custom `ReorderableExerciseList` organism (in `src/components/organisms/ReorderableExerciseList.tsx`), built from `react-native-gesture-handler` and `react-native-reanimated` with the `LongPressDragBox` primitive. `react-native-draggable-flatlist` was not installed because it has no stable release for Reanimated 4.

The builder is a page-sheet modal, so a downward block drag could also drive UIKit's swipe-to-dismiss. `ReorderableExerciseList` reports `onDraggingChange(true)` when a drag starts and `false` on drop or cancel. The editor passes that to `setIsReordering` from `useReorderingSheetLock()`, which, while reordering, calls `navigation.getParent()?.setOptions({ gestureEnabled: false })` on the root `workouts` screen and restores `gestureEnabled: true` on drop, cancel or unmount (it also clears `isReordering` on unmount). While reordering, the unsaved changes guard is suspended too: with `gestureEnabled: false` UIKit still reports a dismiss attempt, and an active `usePreventRemove` would turn that into a Discard prompt mid-drag.

### Unsaved Changes Guard and Save Flow

`useUnsavedChangesGuard(hasUnsavedChanges)` uses `expo-router/react-navigation`'s `usePreventRemove` to show an Alert asking "Discard changes?" when leaving with unsaved changes. It is active on every builder screen. Whether a screen prevents removal is decided by the pure `shouldGuardLeavingBuilder` (in `src/workouts/shouldGuardLeavingBuilder.ts`): only with unsaved changes, not after `leaveWithoutPrompt`, not while reordering, and only for the route whose removal leaves the builder: the root of the builder stack (removing it, or the `workouts` modal itself, dismisses the builder) or the `[workoutId]/edit` route wherever it sits. Later steps (`editor`, `class-details` after `new`) and `superset-info` do not prevent, so stepping back between steps, closing the superset info sheet, and opening or closing the picker (a push on the root stack, which removes nothing) do not ask. `usePreventRemove` also sets `preventNativeDismiss` on the modal, so a swipe-down prompts too. When Discard is tapped, the Alert calls `leaveWithoutPrompt(() => navigation.dispatch(data.action))` to bypass the guard and execute the navigation action.

`useSaveWorkout()` is called by the Save button; an in-flight ref ignores a second tap while a save is running. It runs `saveWorkout(database, editorState)` through the repository, calls `announceWorkoutSaved(name)` into the saved-notice store, shows an Alert if the save fails, and calls `leaveWithoutPrompt(() => router.dismissTo('/create'))` to bypass the guard and close the modal.

`leaveWithoutPrompt` is a function from the editor context that stores a pending callback and sets `isLeavingPermitted` to true, which triggers an effect that runs the callback. This allows Save and Discard to exit without prompting.

### Saved Notice Store and Toast

When a workout is saved, the route calls `announceWorkoutSaved(workoutName)` into `src/stores/workoutSavedStore.ts`. The store is consumed once by `useWorkoutSavedNoticeOnFocus()` on the Create hub, which reads `consumeWorkoutSavedNotice()` on focus and shows a `Toast` atom with the message "Saved <name>".

### Picker Reuse

The exercise picker is opened from inside the builder by calling `beginExercisePick()` into the existing `exercisePickerStore`, then pushing `/exercises/picker` with `mode: 'multiple'` (for Add exercises) or `mode: 'single'` (for Replace). The picker pushes back with results to the same store, so the builder gets them through `useExercisePickResult()`. `useExercisePicks` loads the picked exercises; if that fails it clears the pending pick (ending `isLoadingPick`) and shows an Alert.

### Pure Modules

These hold the builder's logic, import no React Native, and are covered by `bun test`:

- `src/workouts/workoutEditorReducer.ts`: reducer factory that takes a key function, plus all actions, and `createKeyCounter`, the key function used by both `WorkoutEditorProvider` and the tests
- `src/workouts/shouldGuardLeavingBuilder.ts`: which builder route prompts Discard before it is removed
- `src/workouts/normaliseSupersets.ts`: relettering groups and clearing single members
- `src/workouts/groupIntoBlocks.ts`: grouping items into superset blocks and applying block-key order back
- `src/workouts/targetSetColumns.ts`: columns and input rules by tracking type, empty values for each type
- `src/workouts/workoutSaveRows.ts`: mapping from editor state to database rows (positions, superset letters, class vs individual fields)
- `src/workouts/toLoadedWorkout.ts`: conversion from `WorkoutWithItems` (database) to `LoadedWorkout` (reducer input) for opening edit
- `src/workouts/describeWorkout.ts`: text description of a workout kind (Class or Individual with exercise count)
- `src/workouts/workoutNameError.ts`: validation that workout name is not empty
- `src/workouts/supersetCardPositions.ts`: Y-coordinates of superset cards for scroll-to-offset during drag
- `src/workouts/reorderDrag.ts`: slot and scroll maths for the custom sortable list
- `src/workouts/restPresets.ts`: preset rest times and formatting
- `src/workouts/classTypeNuggie.ts`: nuggie choice for each class type
- `src/numbers/numberText.ts`: parsing rules for number inputs (kg one decimal, distance in km)
- `src/images/imageUrls.ts`: image URL validation and error (shared with exercise form)

## Plans

### Routes

Registered flat on the root `Stack`. Every change writes straight through `planRepository` (no draft, no Save button) and the editor reloads on focus.

| Route | Presentation | Purpose |
| --- | --- | --- |
| `/plans/new` | Modal | Name the plan (required, trimmed), then replace the modal with the editor |
| `/plans/[planId]` | Stack push | `PlanWeekEditor`: Monday to Sunday, entries in time order, an empty day shows the `restDay` nuggie and "Rest day". An `ActivePlanBanner` shows at the top when this is the active plan, with tapping opening an action sheet for "Change start date" or "Deactivate" |
| `/plans/[planId]/add-entry` | Form sheet | `AddPlanEntrySheet`: a time picker (default from `defaultTimeOfDayForNewEntry`) and a searchable `WorkoutRow` list; tapping a workout adds it and closes |
| `/plans/[planId]/entry-time` | Form sheet | `EntryTimeSheet`: spinner time picker and Save for one entry, opened by tapping an entry row |
| `/plans/[planId]/activate` | Form sheet | `ActivatePlanSheet`: date picker to set the plan's start date. Opened from the "Make active" button on the inactive banner and from the active banner's "Change start date"; naming a new plan does not open it |
| `/plans/[planId]/copy-day` | Form sheet | `CopyDaySheet`: weekday toggles (source day excluded), opened from the day ⋯ menu |

The Create hub has a "New plan" `ActionCard` under "New workout", and "My plans" between it and "My workouts" (active first with an `ACTIVE` badge, summary from `describePlanSummary`).

### Plan Repository

`src/database/repositories/planRepository.ts` holds all plan SQL:

| Function | Behaviour |
| --- | --- |
| `listPlans(database)` | Every plan with entry count, active first, then newest by creation date |
| `getPlanWithEntries(database, planId)` | One plan with entries joined to workout summary fields (name, kind, class type, duration, image URL, exercise count), or `null` |
| `createPlan(database, name)` | Inserts inactive plan, returns the new id |
| `addPlanEntry(database, newEntry)` | Inserts plan entry, returns the new id |
| `updatePlanEntryTime(database, planId, planEntryId, timeOfDay)` | Updates entry time, scoped by `AND plan_id = ?` so an entry of another plan is never touched |
| `removePlanEntry(database, planId, planEntryId)` | Deletes plan entry, scoped by `AND plan_id = ?` |
| `renamePlan(database, planId, name)` | Updates plan name |
| `duplicatePlan(database, planId)` | Copies plan and all entries, named "(copy)", one transaction, returns the new id |
| `deletePlan(database, planId)` | Deletes plan (entries cascade) |
| `copyDayEntries(database, planId, fromDayOfWeek, toDaysOfWeek)` | Appends entries from source day to chosen days in one transaction, skipping duplicates at the same time, returns count inserted |
| `setActivePlan(database, planId, startsOn)` | Deactivates all plans, then activates the given plan with start date, one transaction |
| `deactivatePlan(database, planId)` | Deactivates the given plan (`UPDATE plans SET is_active = 0 WHERE id = ?`) |
| `getActivePlanWithEntries(database)` | The active plan with entries, or `null` |

### Schedule Repository

`src/database/repositories/scheduleRepository.ts` holds session queries that feed the scheduling model. It has one function:

| Function | Behaviour |
| --- | --- |
| `listSessionsBetween(database, startDate, endDate)` | Every session in the date range (inclusive), taking name, kind and class type from the session's own snapshot columns, and duration, image URL and exercise count from a LEFT JOIN to workouts (null or zero when the workout was deleted), ordered by date and started_at |

### Scheduling Model

`buildScheduledWorkouts` (in `src/plans/buildScheduledWorkouts.ts`) is a pure function that computes a `Map<string, ScheduledWorkout[]>` for a date range given an active plan and sessions. It is never stored, only computed on-demand by `useScheduledWorkouts`.

The algorithm merges plan entries with sessions for each day:
1. If the plan is active (has a start date) and the date is at or after the start date, filter plan entries by the day of week
2. For each plan entry, find the matching session by `plan_entry_id`. If found and not already claimed, mark it as `completed` or `inProgress`. Otherwise, mark the plan entry as `planned` (no session yet)
3. Any remaining sessions are unplanned (user started them ad hoc): add them at the end, with `planEntryId: null` and `timeOfDay: null`

The `ScheduledWorkout` type holds `date`, `timeOfDay` (null for unplanned), `planEntryId` (null for unplanned), `workout` (with `id` that may be null), `status` (`planned | inProgress | completed`) and `sessionId` (null for planned).

### Notes for Phase 04 and 05 consumers

- `ScheduledWorkout.workout.id` may be null (the session's workout was deleted).
- A `planned` entry on a past date means missed.
- A session linked to an entry but started on a different weekday shows as unplanned on its own date, while the original entry stays `planned`.
- Duplicating then activating a plan leaves old sessions linked to the old plan's entries, so they appear as unplanned.

### Hooks

Plan-specific hooks reload on focus. `useFocusReloadKey()` (in `src/hooks/useFocusReloadKey.ts`) holds the shared focus-reload logic: it returns a count that skips the first focus and adds 1 on each later one. `useWorkoutWithItems`, `useActiveSession`, `useScheduledWeeks`, `useProfile` and `useScheduledWorkouts` use it as a reload dependency. Their write functions call repository functions, then call `bumpDataVersion()`, which triggers `useScheduledWorkouts` to recompute:

| Hook | Behaviour |
| --- | --- |
| `usePlans()` | Returns `{ plans, reloadPlans, createPlan }` where plans is `PlanSummary[]` (with id, name, isActive, startsOn, entryCount) or `null` |
| `usePlan(planId)` | Returns `{ planLookup, reloadPlan, addPlanEntry, updatePlanEntryTime, removePlanEntry, copyDay, renamePlan, duplicatePlan, deletePlan, activatePlan, deactivatePlan }`. The planLookup is `{ status: 'loading' } | { status: 'missing' } | { status: 'failed' } | { status: 'found', plan }` |
| `usePlanActions(options)` | Takes options with `planName`, `isActive`, `renamePlan`, `duplicatePlan`, `deletePlan`, `deactivatePlan`, `onChangeStartDate` callback. Returns `{ openMenu, openActiveMenu }` for editor and active banner action sheets |
| `useScheduledWorkouts(startDate, endDate)` | Returns `{ status: 'loading' } | { status: 'failed' } | { status: 'ready', scheduledWorkoutsByDate }`. A result for a different range than requested counts as loading. Loads once on mount, then reloads on later focus and when `dataVersion` changes |
| `useScheduledWorkoutsForDate(date)` | Shorthand for `useScheduledWorkouts(date, date)`, returning `{ status: 'loading' } | { status: 'failed' } | { status: 'ready', scheduledWorkouts }` |

`usePlan.updatePlanEntryTime` and `usePlan.activatePlan` do not reload the plan because they are called from sheets that close straight after and the editor reloads on focus. Writes made from the editor itself (`removePlanEntry`, `renamePlan`, `deactivatePlan`) do reload. `duplicatePlan` and `copyDay` do not reload (duplicate navigates to the copy, copy-day runs from a sheet).

`useScheduledWorkouts` depends on `useDataVersion()` so it reloads whenever the version bumps: after plan writes (in `usePlans` and `usePlan`), workout save, or workout delete.

### Data Version Store

`src/stores/dataVersionStore.ts` is a module-level counter with `bumpDataVersion()`, `subscribeToDataVersion(listener)`, `getDataVersion()`, `resetDataVersion()` and `useDataVersion()` hook. It is bumped after writes that change the schedule or sessions: `usePlans.createPlan`, `usePlan.addPlanEntry`, `usePlan.updatePlanEntryTime`, `usePlan.removePlanEntry`, `usePlan.copyDay`, `usePlan.renamePlan`, `usePlan.duplicatePlan`, `usePlan.deletePlan`, `usePlan.activatePlan`, `usePlan.deactivatePlan`, `useSaveWorkout`, `useWorkoutActions.deleteWorkout`, `useSession` (after every queued write, including set values, ticks, notes, rest changes and structural changes, and after finish and discard), and `useStartSession` (after insertAndOpen and after discardAndStart). `useScheduledWorkouts` reads the version with `useDataVersion()` and recomputes the schedule when it bumps. `useActiveSession` reloads the active session when the version bumps.

### Time Picker

`TimePickerBox` is the only place that renders `@react-native-community/datetimepicker`. It takes `mode` (`time` or `date`) and `display` and applies the theme's accent, text colour and colour scheme.

### Pure Modules

These hold the plans logic, import no React Native, and are covered by `bun test`:

- `src/plans/buildScheduledWorkouts.ts`: merges plan entries with sessions into scheduled workouts (planned entries, completed or in-progress sessions, and unplanned sessions) for a date range
- `src/plans/timeOfDay.ts`: `HH:MM` to and from minutes and `Date`, display formatting, sorting, and the default time for a new entry (07:00 on an empty day, otherwise the last entry + 1 hour, capped at 23:30)
- `src/plans/planCopyDay.ts`: which entries to insert when copying a day, skipping duplicates at the same time
- `src/plans/describePlanSummary.ts`: "n workouts / week" or "No workouts yet"
- `src/plans/describeActiveSince.ts`: "Active since Mon 5 Oct" format for a plan
- `src/plans/groupEntriesByWeekday.ts` and `src/plans/weekdays.ts`: Monday to Sunday sections in time order
- `src/plans/describePlanEntryWorkout.ts`: the class type label or "n ex."
- `src/plans/planNameError.ts`: plan name is required
- `src/workouts/workoutNuggie.ts`: the `workout` nuggie, or the class nuggie for a class
- `src/workouts/filterWorkouts.ts`: workout search by name

## Calendar and Workout Detail

### Routes

The Calendar tab is registered in `src/app/(tabs)/calendar.tsx`. Tapping a day's workout card opens a route based on status: completed sessions open the summary, in-progress sessions open the logger, and planned entries open the detail route.

| Route | Presentation | Purpose |
| --- | --- | --- |
| `/(tabs)/calendar` | Tab | The calendar week strip with the selected day's workouts in time order |
| `/workout/[workoutId]` | Stack push | Workout detail, with optional `date` and `planEntryId` params. Switches on `kind` (individual or class). Loading, missing and failed states show `EmptyState`. Edit pushes the builder edit modal (`/workouts/[workoutId]/edit`). Start button calls `useStartSession` to begin a new session |

### Calendar Hooks

Three hooks manage the calendar's state:

| Hook | Behaviour |
| --- | --- |
| `useWeekPages(centreDate)` | Returns `{ weekStarts, initialWeekIndex, currentWeekIndex, currentWeekStart, visibleWeekStart, showWeek, prependWeeks, appendWeeks }`. Starts with 8 weeks on each side of centre. `currentWeekIndex` is the week containing centre. `visibleWeekStart` is the week whose days are displayed below the strip. `prependWeeks()` and `appendWeeks()` add 8 weeks at the start or end |
| `useSelectedDate(today)` | Returns `{ selectedDate, selectDate, followVisibleWeek }`. Tracks the selected day on the strip. When a swipe settles, `followVisibleWeek(weekStart)` keeps the selection if it is already in that week, otherwise picks today if the week contains it, otherwise the same weekday in that week |
| `useScheduledWeeks(visibleWeekStart)` | Returns `{ lookupDate }`. Caches scheduled workouts by week. On mount it loads the visible week ±1. When `visibleWeekStart` changes it loads only the weeks out of the visible week ±1 that are not cached. On a later focus or a `dataVersion` change it empties the cache and reloads the visible week ±1, dropping results from loads started before the reset. `lookupDate(date)` returns a `ScheduledWorkoutsForDateLookup`: `loading`, `failed`, or `ready` with `scheduledWorkouts`. Failed weeks stay failed until the next reset |

### Week Cache

`src/plans/scheduledWeekCache.ts` holds the week cache and its lookup functions. The cache is a `Map<string, ScheduledWeek>`, where each week key is a Monday's `YYYY-MM-DD` date string. Each week is either `{ outcome: 'ready'; scheduledWorkoutsByDate }` or `{ outcome: 'failed' }`. `missingWeekStarts(cache, visibleWeekStart)` returns the weeks around visible (visible ±1) that are not in the cache. `mergeLoadedWeeks(cache, loadedWeeks)` merges new weeks in. `scheduledWorkoutsForDate(cache, date)` returns a lookup for a single date. `ScheduledWorkoutsForDateLookup` is the result type. It is declared here, and `useScheduledWorkouts` re-exports it.

### Summary Columns and Duration

`PlanEntryWorkout` and `ScheduledWorkoutSummary` gained `targetSetCount` and `targetRestSeconds`. Both are populated by `getPlanWithEntries` and `listSessionsBetween` with SQL:
- `targetSetCount`: count of all `target_sets` rows for the workout
- `targetRestSeconds`: sum of `COALESCE(workout_items.rest_seconds, ?)` for each target set, using a bound `defaultRestSeconds` parameter (90 seconds)

`getWorkoutWithItems` now selects the exercise's `body_part`.

`useWorkoutWithItems` reloads on focus and when `dataVersion` changes. If a reload fails after a successful load, it keeps the earlier result instead of returning `failed`, so a failed focus doesn't hide loaded data from the detail.

### Workout Detail

`estimateWorkoutMinutes({ targetSetCount, targetRestSeconds })` estimates workout duration in minutes by calculating `(targetSetCount * 90 + targetRestSeconds) / 60`, then rounding to the nearest 5 minutes. `estimateMinutesForWorkoutWithItems(workout)` sums target sets and rest from a workout's items and calls the above.

`describeTargetSets(trackingType, targetSets)` returns a text summary:
- Empty: `"No sets"`
- Missing primary value on any set: `"N sets"`
- Uniform: `"N × value [@ weight kg]"` (weight shown for `repetitions_and_weight`)
- Varied: `"value / value / … [@ weight kg]"` (weight range shown when present)

Distances of 1000 m and over are shown as km.

### Session Starting

`useStartSession` handles starting a new session. It calls `startSession(request)` with `workoutId`, `date`, and `planEntryId`. The hook checks for an active session with `getActiveSession`: if found, it shows a single-open-session prompt (Resume, Discard, or Cancel). Resume opens the logger for the existing session. Discard deletes it with `discardSession` and starts the new one. If no active session exists, it creates a new session with `startSession` and opens the logger.

### Pure Modules

These hold the calendar logic, import no React Native, and are covered by `bun test`:

- `src/dates/weekPages.ts`: building starting pages (±8 weeks), prepending and appending, finding a week's index, selected-day-after-page-change rule, month label (Thursday's month), and the page-alignment tolerance for momentum events
- `src/dates/calendarNames.ts`: month names and weekday names for formatted dates
- `src/dates/formatFullDate.ts`: "Monday 5 October" format for a date string
- `src/plans/scheduledWeekCache.ts`: week cache structure, merging loaded weeks, and looking up a date
- `src/plans/dayMarkerState.ts`: marker state (none | completed | missed | planned) by workout status, date and today
- `src/workouts/describeTargetSets.ts`: text summaries of target set ranges by tracking type, with or without weight
- `src/workouts/estimateWorkoutMinutes.ts`: workout duration estimate from target set and rest totals

### Atoms, Molecules and Organisms

| Component | Purpose |
| --- | --- |
| `StatusChip` (atom) | Shows the status (Done green, In progress pink, Missed grey for past dates, none otherwise) as a small labelled chip |
| `DayMarker` (atom) | Renders under the date in a day chip's fixed-height marker slot: checkmark for completed, pink dot for planned, grey dot for missed (past with a missed entry), nothing for no workouts |
| `DayChip` (molecule) | A day on the week strip: weekday letter, date number in a rounded box (selected fill), today ring, and a marker slot. Tappable |
| `ScheduledWorkoutCard` (molecule) | A workout card for a day: image or nuggie, time and kind, name, summary (exercise count and estimated duration for individual; duration for class), status, and play button for planned entries today or earlier |
| `HeaderImageCard` (molecule) | A large card at the top of the detail screen: image if loaded, otherwise a nuggie. Can use `background: 'surface'` or `'accentSoft'` (soft pink for classes) |
| `WorkoutDetailExerciseRow` (molecule) | An exercise in the detail: image or nuggie, name, target summary, and optional superset label and bracket. Tappable to expand a read-only target set table |
| `PagedList` (primitive) | A horizontally paged `FlatList` with `contentInsetAdjustmentBehavior: 'never'`. Used for the week strip to avoid padding in the paged content |
| `WeekStrip` (organism) | Horizontal paged list of weeks. Renders 7 day chips per page. Uses `getItemLayout`, `initialScrollIndex` and `maintainVisibleContentPosition`. Calls `onReachEarliestWeeks` on start reached, deferred until the scroll settles so the offset adjusts while still, `onReachLatestWeeks` on end reached straight away, and `onVisibleWeekChange` with the most visible week (tracked through viewability, not offset) when a scroll settles. Takes `renderMarker(date)` for each day. Calls `onSelectDate` when a day is tapped. Exposes `scrollToWeekIndex` via ref |
| `DayWorkoutList` (organism) | The workouts for the selected day. For planned entries, tapping the card opens the detail route and the play button calls `startSession` through `useStartSession`. For in-progress or completed sessions, tapping the card opens the logger or summary. An empty day shows the rest-day nuggie and a "Browse workouts" button that navigates to Create. Loading and failed states show a message |
| `IndividualWorkoutDetail` (organism) | Detail for individual workouts: header image, name, summary (exercise count, estimated duration, body parts), exercise rows with target summaries and expandable set tables, and a sticky "START WORKOUT" button |
| `ClassWorkoutDetail` (organism) | Detail for class workouts: header image, or the class nuggie on a soft pink card, name, class type badge, duration, description, and a sticky "START CLASS" button |

ScreenHeader gained an optional `action` slot for the "Today" button.

### New Theme Size Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `dayChipCircle` | 36 | Diameter of the date number circle on a day chip |
| `todayRingWidth` | 2 | Border width of the today ring |
| `dayMarkerSlot` | 10 | Height reserved for the marker (checkmark or dot) on a day chip |
| `dayMarkerDot` | 6 | Diameter of the marker dot (planned or missed) |
| `headerCardImageHeight` | 200 | Height of the header image card on detail screens |
| `headerCardNuggie` | 140 | Size of the nuggie image in the header card |
| `detailBottomBarClearance` | 96 | Space at the bottom of scrollable detail content for the sticky button |

## Workout Session

Session management lets users log completed sets, rest times and notes while working out, then finish to view a summary with personal records.

### Routes

Three routes handle sessions and summaries:

| Route | Presentation | Purpose |
| --- | --- | --- |
| `/sessions/[sessionId]` | Full-screen modal (`gestureEnabled: false`) | Session logger for active or resumed sessions. For individual workouts, displays exercise cards with set rows and controls for editing values, adding sets, and marking completion. Shows a rest timer bar when active. A `SessionTopBar` with "✕ Quit" on the left (confirms "Discard this workout?", then discards), the workout name centred between two equal fixed-width side slots (`sessionTopBarSideSlot`) and truncated with an ellipsis, and the elapsed timer on the right. The rest timer bar sits directly under it. A full-width "FINISH" `Button` sits at the bottom, below the scroll content and above the bottom safe-area inset. The top bar is padded by `useSafeAreaInsets().top` and the bottom button by the bottom inset, because a `SafeAreaView` inside this full-screen modal does not apply the insets. For class sessions, shows `ClassSessionView` with the same top bar (right slot empty, since the class timer lives in the ring), a progress ring, a notes field and a "MARK COMPLETE" button at the bottom |
| `/sessions/[sessionId]/finishing` | Full-screen modal (`gestureEnabled: false`) | Runs after `finish()` succeeds. A `NuggieLoadingScreen` that shows the session's stable finishing nuggie and caption, then `router.replace`s to the summary |
| `/sessions/[sessionId]/summary` | Stack push (titled "Summary") | Finished session summary with a large nuggie, personal record list (one row per exercise, best record by priority), and elapsed time. Opens from calendar cards that tap completed sessions or from the finishing screen |

Completed and in-progress sessions opened from calendar cards route directly to their summary or logger through `resolveScheduledWorkoutRoute`, which switches on `status` and `sessionId`.

### Starting a Session

`useStartSession` starts a session or handles an active session. It calls `resolveStartAgainstActiveSession` with the request and the result of `getActiveSession`: if they match (same workout, date, plan entry), it resumes silently and opens the logger. Otherwise if an active session exists, it shows a prompt "Finish or discard {workoutName} first?" with three buttons. **Resume** opens the existing session's logger. **Discard** deletes it, clears the rest timer, bumps `dataVersion`, then creates the new session. **Cancel** closes the prompt and cancels the new start. The repository throws `ActiveSessionExistsError` if a concurrent session already exists. If no active session exists, the hook calls `startSession` to insert the session and opens the logger with `isStarting: 'true'`.

When starting a session, `resolveSessionStart` handles the redo rule: if the plan entry has an unfinished session on the same date, it is resumed with kind `resume`; if only finished sessions exist on that date, a new session is created with `planEntryId = null` (unplanned); otherwise the new session keeps the plan entry. Classes get no exercises on initial insert; exercises are added only for individual workouts.

### Session Logger and Write Queue

`useSession(sessionId)` loads the session and manages all writes. It keeps a write queue (`writeQueue.current` is a `Promise<void>`) and debounces text input with `textInputDebounceMilliseconds` (400 ms). When the user edits a set's numeric values or notes, the hook schedules a write with `setTimeout`. If the user edits the same field again before the timeout, it cancels the pending write and reschedules. This debounce keeps writes out of the way of typing. On unmount, and when `AppState` changes to `background` or `inactive`, the hook enqueues every pending value and notes write so no data is lost on navigation or when the app is closed. The `AppState` listener is removed on unmount.

The hook also tracks which sets and whether the notes have been changed locally but not yet written. A set id is added on every value change and removed inside its write task only after `updateSessionSet` resolves, and only if no newer change arrived while it was writing. Notes use a change count and a saved change count in the same way.

When `finish()` is called, the hook flushes pending writes first, then finishes the session, clears the rest timer and bumps `dataVersion`. When `discard()` is called, the hook cancels pending debounced writes, waits for writes already queued, then discards the session, clears the rest timer and bumps `dataVersion`. The logger route holds an in-flight ref so a second Finish, Discard or Mark complete confirmation does nothing while one is running.

Structural changes (adding or removing sets, adding, replacing or removing exercises) go through `enqueueStructuralChange`. It first enqueues every pending debounced write, so typed values are written ahead of the change, then runs the database operation, reloads the session with `getSessionWithExercises` and merges it back using `mergeReloadedSession`. The merge keeps local values for sets that are changed but not yet written (or whose tick changed while the change was queued) and keeps unsaved notes, while taking the structure and other values from the database. When an exercise's tracking type changed, kept local values go through `actualValuesAfterReplace` so the replace clearing rule still applies.

### Rest Timer Store

`src/stores/restTimerStore.ts` holds a module-level rest timer state read with `useSyncExternalStore` like the exercise picker store. `startRestTimer(restSeconds)` begins a countdown. The timer state is one of idle, running (tracks `endsAtMilliseconds` and `durationSeconds`), or paused (tracks `remainingSeconds`). `pauseRestTimer` and `resumeRestTimer` toggle pause. `clearRestTimer` resets to idle. The haptic feedback and clear at 0 seconds happen in the `useRestTimer` hook's effect, which runs while the timer is running. Only a small `SessionRestTimerBar` wrapper inside `SessionLogger` calls `useRestTimer`, so its 250 ms ticks re-render the rest bar and not the whole logger. `CountdownButton` holds its `onFinish` callback in a ref, so its interval depends only on the run state and is not recreated by parent re-renders.

`resolveRestTimerStart(exercises, tickedSessionSetId)` decides when ticking a set should start rest. For non-superset exercises, rest starts immediately after the ticked set completes. For superset members, rest starts when the ticked set completes its round: every member has its set at that position ticked, and members without a set at that position count as done. This applies whichever member is ticked last. The rest time used is the group's last member's `rest_seconds`. A `rest_seconds` of null means rest is off, so no rest timer starts (for a superset, when the last member's rest is null).

### Session Exercise Rest Seconds

Starting a session copies `rest_seconds` from the workout item, including null for rest that is off. Exercises added mid-session get an explicit 90 seconds. The card's ⋯ menu offers a "Rest time" picker to edit `rest_seconds` for that session's exercise. The edit calls `updateSessionExerciseRest` and the hook bumps `dataVersion` afterward so the calendar markers recompute.

### Finishing and Personal Records

When Finish is tapped, `resolveFinishPrompt` counts unticked sets and returns one of three outcomes: `finish` (all sets ticked), `confirmUnticked` with the count (some sets ticked), or `offerDiscard` (no sets ticked, or an individual session with no sets at all). Class sessions do not use the prompt: Mark complete finishes straight away. The logger shows the appropriate alert. When finishing, `finishSession` deletes all unticked sets and any exercises left with no sets, then sets `finished_at`. A tapped set stays editable and can be unticked.

`useFinishedSession(sessionId)` loads once per sessionId, does not reload on focus, but reloads when `dataVersion` changes (after link or unlink). It loads the finished session with `getSessionWithExercises`, then calls `listCompletedSetsForExercises(database, exerciseIds, session.startedAt)` to get completed sets from finished sessions that started earlier. It detects personal records by calling `detectPersonalRecords(currentSets, earlierSets)`. Current sets come from the finished session, flattened with `flattenCompletedSets`.

`detectPersonalRecords` returns `PersonalRecord[]` (exerciseId, recordType, set). For weighted sets (repetitions_and_weight), it detects three types: heaviestWeight, bestEstimatedOneRepMax (Epley formula, capped at 12 reps, compared as `weight × (30 + reps)` so equal estimates tie exactly), and mostRepetitionsAtWeight. For other types it detects mostRepetitions, longestDuration, or longestDistance. It compares current sets to earlier ones and only counts improvements (never ties). The first-time rule: no records are returned if the exercise has no earlier completed sets. The summary detail shows "(est. 1RM N kg)" only for sets of 12 reps or fewer. `selectBestRecordPerExercise` picks one record per exercise by priority: heaviest weight first, then 1RM estimate, then most reps at weight, then most reps, longest duration, furthest distance.

### Finishing Nuggie and Caption

The finishing nuggie and caption come from `chooseFinishingPresentation(input, random)`, which calls `chooseNuggie` with `kind: 'sessionFinished'`. Input includes `workoutKind`, `classType` and `personalRecordCount` (from `countExercisesWithRecords`, which counts exercises with at least one record). The nuggie rule: beast if `personalRecordCount > 0`; goodJob if `workoutKind` is class; otherwise a random celebrate variant. The caption is "New personal record!" if records exist, "Workout complete!" for individual workouts, or "Namaste — class complete!" for yoga or "Class complete!" for other classes. Both the finishing screen and the summary call `chooseStableFinishingPresentation(sessionId, input)`, which uses `randomFromSessionId(sessionId)` to seed a deterministic PRNG, so the finishing screen and every later summary show the same nuggie for a session. The summary route takes no nuggie param.

### Class Session View

For class sessions, the logger shows a `ClassSessionView` instead of exercise cards. It displays the class nuggie, elapsed time, a progress ring scaled to the planned duration, the ring's label (time elapsed / planned), and a notes field. At or past the planned duration the ring stays full while the timer continues. The progress ring uses the `ProgressRingBox` primitive with `react-native-svg`.

### Calendar Card Routing

Completed sessions opened from calendar cards tap into `/sessions/[sessionId]/summary`. In-progress sessions open the logger at `/sessions/[sessionId]`. Planned entries open the detail route. `resolveScheduledWorkoutRoute(scheduledWorkout)` switches on the status and returns the route.

### Resume Banner

The tabs layout shows an `ActiveSessionBanner` on the Home and Calendar tabs when there is an active session. The banner displays the elapsed time and is tappable to open the logger. It updates every 15 seconds (`bannerRefresh` duration token). Tapping navigates to `/sessions/[sessionId]` without `isStarting` param.

### Pure Modules

These hold the session logic, import no React Native, and are covered by `bun test`:

- `src/sessions/resolveStartAgainstActiveSession.ts`: single-open-session logic and prompt title by workout name
- `src/sessions/resolveSessionStart.ts`: linking new sessions to plan entries and the redo-a-done-entry rule
- `src/sessions/describeActiveSessionBanner.ts`: elapsed time text for the resume banner
- `src/sessions/resolveRestTimerStart.ts`: rest timer trigger and rest-time selection by superset structure
- `src/sessions/fillSetForTick.ts`: set value filling on first tick and validation rules
- `src/sessions/valuesForAddedSet.ts`: copying last set's actual or target values when adding a set
- `src/sessions/replaceExercise.ts`: which actual values are cleared when changing an exercise
- `src/sessions/describePreviousSet.ts`: format text for the previous set row in each exercise, plus `matchPreviousSets` which matches sets by position
- `src/sessions/describeExerciseBestSet.ts`: best set text for an exercise in a finished session
- `src/sessions/mergeReloadedSession.ts`: merge reloaded structure and values with pending writes
- `src/sessions/normaliseSessionExercises.ts`: clear superset groups for single exercises on reload
- `src/sessions/sessionSetChanges.ts`: editing operations (change, find, toggle completion)
- `src/sessions/calculateSessionTotals.ts`: elapsed seconds, total volume and completed set count
- `src/sessions/finishPrompt.ts`: finish prompt outcomes (finish, confirmUnticked, offerDiscard) by ticked set count
- `src/sessions/classRingProgress.ts`: progress ratio (elapsed / planned) and duration label for the class ring
- `src/sessions/countdownProgress.ts`: progress ratio for a countdown-duration set
- `src/sessions/chooseFinishingNuggie.ts`: nuggie and caption choice with stable picking by session id
- `src/sessions/restTimerState.ts`: rest timer state transitions (start, pause, resume, clear)
- `src/sessions/formatSessionValues.ts`: format display text for set values by tracking type
- `src/sessions/resolveScheduledWorkoutRoute.ts`: route resolution (summary, logger, or detail) by workout status and session id
- `src/progress/detectPersonalRecords.ts`: all record detection types, comparisons, priority and best-per-exercise selection
- `src/progress/describePersonalRecord.ts`: format text for a personal record in the summary
- `src/progress/flattenCompletedSets.ts`: flatten session exercises and sets into completed set rows

### Hooks

Session-specific hooks manage the logger state and rest timer:

| Hook | Behaviour |
| --- | --- |
| `useSession(sessionId)` | Returns `{ sessionLookup, previousSetsByExerciseId, changeSetValues, toggleSetCompletion, addSet, removeSet, changeExerciseRest, changeNotes, finish, discard, addExercises, replaceExercise, removeExercise }`. Loads the session on mount, debounces set value and notes writes with a 400 ms delay, flushes pending writes on unmount, when the app goes to the background or inactive, and before finish, cancels them before discard, and queues structural changes (after enqueueing pending writes) through `getSessionWithExercises` and merge. Finish and discard clear the rest timer and bump `dataVersion`. If a write fails it shows an alert |
| `useRestTimer()` | Returns `{ remainingSeconds: number | null, isPaused: boolean, pause, resume }`. Reads the module-level rest timer store with `useSyncExternalStore`. The hook's effect checks for timer end every 250 ms (`fastTimerTick`), gives a haptic at zero, and clears the timer |
| `useActiveSession()` | Returns `{ status: 'loading' } \| { status: 'failed' } \| { status: 'active', activeSession } \| { status: 'none' }`. Loads on mount with `getActiveSession` and reloads on focus and on `dataVersion` change. Used by the resume banner |
| `useFinishedSession(sessionId)` | Returns `{ status: 'loading' } \| { status: 'missing' } \| { status: 'failed' } \| { status: 'found', session, personalRecords }`. Loads once per sessionId with `getSessionWithExercises`, calls `listCompletedSetsForExercises` to load earlier sets, then detects records with `detectPersonalRecords`. Reloads when `dataVersion` changes (after link or unlink) |
| `useStartSession()` | Returns `{ startSession }`. Starts a new session or shows the single-open-session prompt. Uses an in-flight ref to prevent concurrent start attempts. See above for details |
| `useSessionExercisePicks()` | Returns `{ exerciseIds, clearExerciseIds }` for the exercise picker opened from the logger. Uses the same pick store pattern as the builder |

### Session Repository

`src/database/repositories/sessionRepository.ts` holds all session SQL:

| Function | Behaviour |
| --- | --- |
| `startSession(database, request)` | Throws `ActiveSessionExistsError` if a different unfinished session is open. If the matching open session exists, returns that session's id without inserting. Otherwise: if the plan entry has an unfinished session on that date, resumes it; if only finished sessions exist on that date, inserts a new session with `plan_entry_id = NULL`; otherwise inserts with the entry. Inserts copy the workout snapshot fields. For individual workouts, inserts session_exercises rows from the workout with rest_seconds and target_sets rows; classes get no exercises. Returns the session id. Runs in one transaction |
| `getActiveSession(database)` | The first unfinished session, or null. Returns an `ActiveSession` summary with `{ id, workoutId, planEntryId, workoutName, scheduledDate, startedAt }` |
| `getSessionWithExercises(database, sessionId)` | One session with all exercises and sets, or null. Returns a `SessionWithExercises` with exercises, each with sets. Joins to exercises and workouts for metadata |
| `updateSessionSet(database, sessionSetId, values)` | Updates value fields (repetitions, weight_kilograms, duration_seconds, distance_meters) for a session set |
| `completeSessionSet(database, sessionSetId, completedAt)` | Sets `completed_at` to the provided timestamp |
| `uncompleteSessionSet(database, sessionSetId)` | Clears `completed_at` (sets to NULL) |
| `addSessionSet(database, sessionExerciseId, values)` | Inserts a new set with the given values at the next position |
| `removeSessionSet(database, sessionExerciseId, sessionSetId)` | Deletes the set and renumbers remaining set positions in the transaction |
| `addSessionExercises(database, sessionId, exerciseIds)` | Inserts new exercise rows for each exercise with position at the end, the exercise's default tracking type, and default 90 s rest. Creates one empty set per exercise |
| `replaceSessionExercise(database, sessionId, sessionExerciseId, newExerciseId)` | Updates the exercise and tracking type, applies `actualValuesAfterReplace` to all sets to clear incompatible values |
| `removeSessionExercise(database, sessionId, sessionExerciseId)` | Deletes the exercise and all its sets, then renormalises remaining exercises (positions and superset groups) in one transaction |
| `updateSessionExerciseRest(database, sessionId, sessionExerciseId, restSeconds)` | Updates rest_seconds for the exercise. The hook bumps dataVersion |
| `updateSessionNotes(database, sessionId, notes)` | Updates session notes |
| `getPreviousSessionSets(database, exerciseId, beforeSessionId)` | Returns completed sets from the most recent finished session where the exercise appeared and started before the session `beforeSessionId`. Each set includes `position` and the value fields. Returns empty array if no earlier session has that exercise |
| `finishSession(database, sessionId)` | Deletes all unticked session sets and any exercises left with no sets, then sets `finished_at` to now. The hook bumps dataVersion |
| `discardSession(database, sessionId)` | Deletes the session row (cascades delete exercises, sets). The hook bumps dataVersion |
| `listCompletedSetsForExercises(database, exerciseIds, beforeStartedAt)` | Returns completed sets from finished sessions that started before the given timestamp, for any of the exercise ids. No ordering |
| `linkHealthWorkout(database, sessionId, linkedWorkout)` | Links a Garmin or other Apple Health workout to the session by updating `health_workout_uuid`, `health_average_heart_rate`, `health_maximum_heart_rate`, `health_active_kilocalories` and `health_duration_seconds` |
| `unlinkHealthWorkout(database, sessionId)` | Removes a linked Health workout by clearing the same fields to `NULL` |

### New Theme Size Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `sessionClassNuggie` | 140 | Size of the nuggie on a class session view |
| `restBarNuggie` | 36 | Size of the nuggie in the rest timer bar |
| `classRing` | 220 | Diameter of the progress ring on a class session view |
| `classRingStroke` | 12 | Stroke width of the progress ring |
| `countdownButtonHeight` | 36 | Height of the countdown-duration set button |
| `countdownButtonIcon` | 14 | Icon size in the countdown button |
| `sessionTopBarSideSlot` | 88 | Width of each side slot in the session top bar, so the workout name stays centred |
| `minimumTouchTarget` | 44 | Smallest touch target; the countdown button's `hitSlop` makes up the difference from its height |
| `previousColumn` | 72 | Width of the previous set column in session set rows |
| `shakeDistance` | 8 | Horizontal distance for the shake animation |
| `statTileMinimumHeight` | 88 | Minimum height of a stat tile in the summary |
| `healthPermissionNuggie` | 72 | Size of the nuggie in the health permission card on Home. The rest-day and no-plan cards use it too |
| `coachButtonClearance` | 96 | Bottom padding that scrolling Home content needs to clear the floating Coach button (see Home Dashboard) |
| `todayCardWidthRatio` | 0.82 | Width of a today workout card as a share of the window width |
| `todayCardImageHeight` | 180 | Height of the image area on a today workout card |
| `todayCardNuggie` | 120 | Size of the fallback nuggie on a today workout card |
| `todayCardActiveBorderWidth` | 2 | Accent border on the card of an in-progress workout |
| `pageDot` | 8 | Diameter of a carousel page dot |
| `statTileIcon` | 16 | Icon size in a detailed stat tile and in the trend arrow |
| `statTileRing` | 28 | Diameter of the steps ring in its tile |
| `statTileRingStroke` | 4 | Stroke width of the steps ring in its tile |
| `statTileNuggie` | 32 | Size of the nuggie in the corner of a stat tile |
| `streakDot` | 12 | Size of a day dot on the weekly streak tile |
| `streakDotOutlineWidth` | 2 | Outline width of a pending streak dot |
| `statBarHeight` | 12 | Height of a bar on the detail screens |
| `statBarDateColumn` | 88 | Width of the date column in a detail bar row |
| `statBarValueColumn` | 72 | Width of the value column in a detail bar row |

Phase 07 also adds the `attention` and `attentionSoft` colours, in both the light and the dark palette. A stat tile in the `attention` tone uses them.

## Apple Health Integration

### Module Boundary

`src/health/` holds Apple Health integration. Only three adapter files import `@kingstinct/react-native-healthkit`: `healthAuthorization.ts`, `readDailyHealth.ts`, and `readHealthWorkouts.ts`. All other files in the module are pure (no React Native imports) and import only `@/dates` helpers and each other. The module exports `requestHealthAuthorization()` from the authorization adapter, and `findOverlappingWorkouts()` and `readWorkoutHeartRate()` from the workouts adapter.

### Adapter Files

| File | Purpose |
| --- | --- |
| `healthAuthorization.ts` | Requests HealthKit read access for steps, sleep, resting heart rate, heart rate and workouts. Returns outcome: `authorized`, `denied`, or `unavailable` |
| `readDailyHealth.ts` | Reads `steps`, `sleepMinutes` and `restingHeartRate` for a date, using async queries from HealthKit. Called by `useDailyHealth` |
| `readHealthWorkouts.ts` | Reads overlapping workouts and their heart rate ranges for a time window (start and end dates), disposes every workout proxy. Called by `useOverlappingHealthWorkouts` |

### Pure Modules

These hold Apple Health logic and are covered by `bun test`:

- `HealthTypes.ts`: `DailyHealth` (date, steps, sleepMinutes, restingHeartRate), `HealthWorkout` (uuid, activityTypeCode, startDate, endDate, durationSeconds, activeKilocalories, sourceName, bundleIdentifier), `WorkoutHeartRate` (averageHeartRate, maximumHeartRate), `HealthAuthorizationOutcome`
- `computeSleepMinutes.ts`: filter sleep samples to asleep stages (1, 3, 4, 5), use only Garmin samples when any exist, merge overlapping intervals, sum minutes and return null if none qualify
- `healthDayRange.ts`: local midnight to `now` for today, or local midnight to midnight for a past date
- `healthSleepRange.ts`: 18:00 on the previous day to 12:00 on the given date
- `pickRestingHeartRate.ts`: pick the latest resting heart rate sample within the local day
- `describeWorkoutActivity.ts`: activity name from HealthKit activity type code (Running, Cycling, Swimming, etc.)
- `groupHealthWorkouts.ts`: split workouts into `garminWorkouts` and `otherWorkouts` by source, each sorted by start time
- `findSuggestedHealthWorkout.ts`: return a Garmin workout only when exactly one overlaps at least 50% of the session duration, otherwise null
- `isHealthSnapshotFinal.ts`: determine if a snapshot is final (its `fetchedAt` is after noon on the day after its date, and at least one of steps, sleep and resting heart rate has a value; an all-null snapshot is never final, so a day fetched before the watch synced or before Health access was granted is read again)
- `shouldRefreshHealth.ts`: rate-limit reads with a 5-minute throttle per date
- `shouldShowHealthAccessHint.ts`: show the access hint when authorization has been requested but no data is available
- `formatSteps.ts`, `formatSleepMinutes.ts`, `formatRestingHeartRate.ts`: format health values for display
- `formatWorkoutValues.ts`: format workout duration, kilocalories and heart rate ranges for display
- `healthWorkoutSearchWindow.ts`: search window from 30 minutes before the session starts to 30 minutes after it finishes (using `now` if the session is not finished)
- `healthRefreshThrottle.ts`: module-level memory of when each date's refresh last started (`getLastRefreshStartedAt`, `markRefreshStarted`, `clearRefreshStarted`). `useDailyHealth` and `useHealthRange` share it, so the 5-minute throttle in `shouldRefreshHealth` applies per date across both
- `healthRangeDatesToBackfill.ts`: from a list of dates and the cached snapshots, the dates that have no snapshot or whose snapshot is not final
- `mergeHealthSnapshots.ts`: merges incoming snapshots into a map by date. An incoming snapshot replaces the existing one when its `fetchedAt` is the same or later
- `compareToAverage.ts`: compares today's value to the mean of the previous values that are present. Returns `null` when today's value is null or no previous value is present. Otherwise it returns the average, the difference rounded with `Math.round`, a `direction` (`up`, `down`, `level`) and a `tone`: `positive` for down or level, `attention` for up by 5 or more, `default` for any other rise
- `describeStepProgress.ts`: percentage of the step goal (rounded down), a caption such as "42% of 10k", the ring progress clamped at 1, and whether the goal is reached. A goal of 0 or less gives 0%. It also exports `formatCompactStepGoal`
- `healthSettingKeys.ts`: `healthAuthorizationRequestedAtSettingKey` for the authorization request timestamp
- `isGarminSource.ts`: detect Garmin workouts by checking whether bundle identifier contains "garmin" (case-insensitive) or source name contains "Garmin"

### Hooks

Health-specific hooks manage data loading and caching:

| Hook | Behaviour |
| --- | --- |
| `useHealthAuthorization()` | Returns `{ hasRequestedAuthorization, isRequesting, requestAuthorization }`. Loads the request timestamp from app settings on focus. `hasRequestedAuthorization` is `null` while loading, `true` if authorization has been requested (outcome was `authorized` or `denied`), `false` if not requested. `requestAuthorization()` calls the adapter, saves the request timestamp and returns the outcome |
| `useDailyHealth(date)` | Returns `{ snapshot, isLoading, refresh }`. Loads the snapshot from the database cache. Per-date refresh timestamps are held in module-level memory; the snapshot cache is the database. On mount it loads the cached snapshot. On focus and when the app returns to the foreground, only queries HealthKit if the `healthAuthorizationRequestedAtSettingKey` setting exists, then checks if a refresh is needed: skips refresh if the cached snapshot is final or if the 5-minute throttle per date blocks it. When a refresh runs, reads through `readDailyHealth` and upserts the snapshot. Every cache read and every fresh snapshot is merged into state with a functional update through `pickNewerHealthSnapshot` (the single-snapshot rule that `mergeHealthSnapshots` also uses), so the later `fetchedAt` wins and a late cache read never replaces a fresher snapshot; values for a date that is no longer current are ignored. The focus, foreground and `refresh()` triggers share one reentrancy guard: at most one run is in flight, and a trigger that arrives mid-run queues exactly one rerun, so `refresh()` after Connect still ends in a fresh read once authorisation is stored. A snapshot is final when its `fetchedAt` is after noon on the day after its date and it has at least one value (steps, sleep or resting heart rate); an all-null snapshot is never final. Final snapshots do not refresh. `isLoading` is true until a snapshot has been loaded for the requested date |
| `useOverlappingHealthWorkouts(sessionId)` | Returns `{ lookup, refresh, link, isLinking }` where lookup is `{ status: 'loading' | 'unavailable' | 'failed' | 'ready' }`. On mount loads the session and its time window, then finds overlapping workouts and groups them. Returns `unavailable` when Apple Health access was never requested and `failed` when the session or the read fails. Reloads on focus. `refresh()` forces a reload. `link(workout)` reads the workout's heart rate range, updates the session with `linkHealthWorkout`, bumps dataVersion and returns `'linked'`, `'busy'` (another link is already in flight, nothing was changed) or `'failed'`. Callers alert only on `'failed'` |
| `useUnlinkHealthWorkout(sessionId)` | Returns an async callback that calls `unlinkHealthWorkout(database, sessionId)` and bumps dataVersion. Used by the session summary to unlink a previously linked health workout |

`useHealthRange(startDate, endDate)` (Phase 07) is described in the Home Dashboard section.

### Components

Phase 06 adds molecules and an organism for health data on the Home tab and on the session summary:

| Component | Purpose |
| --- | --- |
| `NuggieActionCard` (molecule) | Shared card layout: nuggie image, title, optional message and one action button. `RestDayCard`, `NoPlanCard` and `HealthPermissionCard` are thin wrappers around it |
| `HealthPermissionCard` (molecule) | Card on Home when authorization has not been requested, with a coach nuggie, description and Connect button, rendered through `NuggieActionCard` |
| `HealthWorkoutRow` (molecule) | A clickable row for a health workout: activity name, time range with duration and calories, and source name |
| `LinkedHealthWorkoutRow` (molecule) | Linked workout summary headed "Linked workout" (the source may be Garmin or another app), with heart rate, calories and duration, and Unlink button |
| `HealthSuggestionBanner` (molecule) | Card offering to link a suggested matching workout: "Link Garmin {activity} ({duration})?" Shown in `SessionSummary` when the session has no linked workout and exactly one Garmin workout overlaps at least 50% of the session duration |
| `LinkHealthWorkoutSheet` (organism) | Form sheet (detents 0.6 and 1) listing Garmin workouts first, then "Other sources", each sorted by start time. Takes the lookup `status`: renders nothing while `loading`, "Connect Apple Health on Home first" for `unavailable`, "Could not read Apple Health" with a Refresh button for `failed`, and for `ready` with no Garmin workout "No Garmin workout found around this time — make sure Garmin Connect has synced" with a Refresh button |

### Routes

| Route | Presentation | Purpose |
| --- | --- | --- |
| `/sessions/[sessionId]/link-health-workout` | Form sheet | `LinkHealthWorkoutSheet` allowing manual selection of an overlapping workout to link. Opened from the session summary |

## Home Dashboard

Phase 07 turns the Home tab (`src/app/(tabs)/index.tsx`) into a dashboard. It uses the profile repository above and the Phase 06 health data.

### Home Layout

From top to bottom, inside a `ScrollBox` on a `SafeAreaView` with only the top edge:

1. `GreetingHeader`: the line from `chooseGreeting(now, displayName)` and the full date from `formatFullDate`.
2. The today section, shown once `useScheduledWorkoutsForDate(today)` is `ready` (nothing while it loads or fails):
   - one or more workouts: `TodayCarousel`
   - none, and `hasActivePlan` is true: `RestDayCard`, whose button opens `/create`
   - none, and no active plan: `NoPlanCard`, whose button opens `/plans/new`
3. `StatTileGrid`, with `WeeklyStreakTile` passed in through its `weeklyTile` slot.
4. The no-data hint `EmptyState`, when `shouldShowHealthAccessHint` is true. It sits below the grid.

Tapping a tile calls `router.navigate({ pathname: '/stats/[metric]', params: { metric } })`.

### Permission Card Rule

`StatTileGrid` takes `hasRequestedAuthorization`:

| Value | What the grid shows |
| --- | --- |
| `null` (still loading) | Only the weekly streak tile, in a half-width row |
| `false` (access not yet asked for) | `HealthPermissionCard` replaces the three health tiles. The weekly streak tile shows below it in a half-width row |
| `true` | A 2 × 2 grid: Steps and Sleep on the first row, Resting HR and the weekly streak tile on the second |

Once access has been asked for, the grid shows whether it was granted or denied. Without data, each health tile reads "No data yet". When today's snapshot has no steps, sleep or resting heart rate at all, `shouldShowHealthAccessHint` is true and the hint shows below the grid.

### Greeting

`chooseGreeting(now, displayName)` returns "Hi there" when the name is null or blank. With a name it returns "Good morning, {name}" before 12:00, "Good afternoon, {name}" before 17:00 and "Good evening, {name}" after that. The name comes from the profile form (Phase 08); until it is set, Home shows "Hi there".

### Today Carousel

`TodayCarousel` shows a "TODAY'S WORKOUTS" header with the count, a `SnapList` of `TodayWorkoutCard`, and `PageDots` when there is more than one workout. The card width is `todayCardWidthRatio` of the window width, and the list snaps every card width plus the medium gap. The active dot comes from `carouselPageIndex` on the scroll offset, clamped to the last workout when the list shrinks. The list bleeds to the screen edges with a negative horizontal margin on its wrapper.

`TodayWorkoutCard` shows the workout image (or the workout's nuggie when it has none or the image fails to load), the kind line, the name and the summary. The kind line and the summary come from `describeScheduledWorkoutKind` and `describeScheduledWorkoutSummary` in `src/workouts/describeScheduledWorkout.ts`, which `ScheduledWorkoutCard` on the Calendar now uses too. The action button label comes from `todayWorkoutActionLabel`: "▶ Start" for planned, "Resume" for in progress and "✓ Done" for completed. Pressing it on a planned workout calls `onStart`, which Home wires to `useStartSession`. For the other statuses it calls `onPress`, which opens the route from `resolveScheduledWorkoutRoute`. The button is a separate accessible element beside the text block, and the card's outer touchable is hidden from VoiceOver. A planned workout whose workout was deleted has no button and cannot be opened.

### Stat Tiles

`StatTile` keeps its compact layout when none of `icon`, `caption`, `accessory` or `nuggie` is passed, so `SessionSummary` looks as before. With any of them it draws the detailed layout: icon and label, an optional nuggie in the corner, the value, and a row of accessory and caption. Its `tone` is `default`, `positive` or `attention`, which picks the text and background colours. With `onPress` the detailed layout is a button; the compact layout ignores `onPress`. The button's label is the label, value and caption, followed by the optional `accessibilityDetail` string, because the button groups its children and VoiceOver would otherwise never reach the trend arrow or the streak dots. The resting HR tile fills it with `describeRestingHeartRateTrend` (for example "down 2 beats per minute from 7-day average" or "level with 7-day average"), and the weekly tile fills it with `describeStreakDays`, the same text `StreakDots` uses as its own label. Tone text uses the `successText` and `attentionText` palette tokens (not `success` and `attention`), which are dark enough to read on `successSoft` and `attentionSoft` in the light palette. The soft backgrounds and icons are unchanged.

| Tile | Value and caption | Accessory and tone |
| --- | --- | --- |
| Steps | `formatSteps`, and the `describeStepProgress` caption, or "No data yet" | A `ProgressRingBox` at `statTileRing`. `positive` and the `stepGoalReached` nuggie when the goal is reached |
| Sleep | `formatSleepMinutes`, with caption "Last night", or "No data yet" | `attention` and the `lowSleep` nuggie below 360 minutes |
| Resting HR | `formatRestingHeartRate`, with caption "vs 7-day avg" when a trend exists, "No data yet" when there is no value, and no caption when there is a value but no trend | A `TrendArrow`, and the trend's tone |
| This week | `{completed} / {planned}`, or a dash and "No data yet" before the week loads | `StreakDots`. `positive` and the `weeklyTargetMet` nuggie (`goodJob`) when the target is met |

Home passes the resting HR trend from `compareToAverage(today, previous 7 days)`, where the previous days are read with `useHealthRange` and a missing day counts as no value. `TrendArrow` shows an up, down or equals symbol and the absolute difference. `StreakDots` shows one dot per day: filled for `completed` and `unplanned`, an outline for `pending`, a grey fill for `missed` and a small dot for `rest`.

### ProgressRingBox and SnapList

`ProgressRingBox` has two optional props, `size` and `strokeWidth`. Without them it uses `sizes.classRing` and `sizes.classRingStroke`, so the class session view is unchanged. The steps tile passes `statTileRing` and `statTileRingStroke`. There is no separate `ProgressRing` atom.

`SnapList` (in `src/components/primitives/SnapList.tsx`) is a horizontal `FlatList` with `snapToInterval` taken from its required `snapInterval` prop, `decelerationRate="fast"` and no scroll indicator. It exists because `PagedList` forces `pagingEnabled`, which cannot snap at a card width smaller than the screen. The other `FlatList` props are passed through, except `horizontal`, `pagingEnabled`, `snapToInterval` and `decelerationRate`.

### Weekly Streak

`useWeeklyStreak(now, weeklyWorkoutTarget)` returns `{ status: 'loading' }`, `{ status: 'failed' }` or `{ status: 'ready', streak, isTargetMet }`. It builds the seven dates of the current week from `startOfWeek` (Monday to Sunday), reads them with `useScheduledWorkouts`, and passes them with the `weeklyWorkoutTarget` to `calculateWeeklyStreak` and `isWeeklyTargetMet`.

`calculateWeeklyStreak` (in `src/progress/calculateWeeklyStreak.ts`) is pure. A workout counts as planned when it has a `planEntryId`, and as completed when its status is `completed`. `countScheduledWorkouts` counts per list of workouts: a completed workout adds 1 to both counts, an unfinished planned one adds 1 to the planned count only, and an unfinished unplanned one adds to neither. Each day gets the first state that applies:

1. `rest`, when nothing is scheduled that day
2. `missed` (a past day) or `pending` (today or later), when a planned workout is not completed
3. `completed`, when a completed workout is planned, or `unplanned`, when the completed ones are all unplanned
4. `rest` (a past day) or `pending` (today or later), for anything left, such as an unfinished unplanned session

Home owns the single `useProfile` call and passes `weeklyWorkoutTarget` in, so the hook does not read the profile itself. Its result is memoised on the lookup status, the scheduled workouts map, today, the week dates and the target.

`isWeeklyTargetMet` is true when completed is at least the weekly target, or when planned is above 0 and completed is at least planned.

### Health Range

`useHealthRange(startDate, endDate)` returns `{ snapshotsByDate, isLoading }`. It reads the cached snapshots for the range from the database and shows them at once. If the `healthAuthorizationRequestedAtSettingKey` setting exists, it then backfills, in sequence: for each date from `healthRangeDatesToBackfill`, if the shared `healthRefreshThrottle` allows it, it marks the refresh started, reads `readDailyHealth`, upserts the snapshot and merges it into state. A failed read clears that date's throttle mark. Every merge into state uses `mergeHealthSnapshots` in a functional update, so overlapping runs cannot drop each other's days. A run requested while one is running queues exactly one rerun. It runs on focus and when the app returns to the foreground. `useDailyHealth` uses the same throttle module and behaves as before.

### Stats Detail Route

`/stats/[metric]` is registered flat on the root `Stack` with an empty title and no large title (the screen sets its own title). `parseStatsMetric` (in `src/stats/parseStatsMetric.ts`) accepts `steps`, `sleep`, `restingHeartRate` and `streak`. Any other value shows an `EmptyState` titled "Nothing to show". Otherwise the route builds the last 14 days, today included, newest first with `datesBetween`. The day count and the tile hint ("Opens the last 14 days") are exported from `src/stats/statsDetail.ts` as `statsDetailDayCount` and `statsDetailHint`, so the route and both tile owners share one source. The route calls `useHealthRange` and `useScheduledWorkouts` unconditionally at the top, before the invalid-metric early return, and passes the results to one of two presentational organisms:

- `HealthMetricBarList` (for `steps`, `sleep` and `restingHeartRate`): receives `snapshotsByDate` as a prop, formats each value with the matching formatter, and sizes each bar against the largest value in the 14 days
- `StreakBarList` (for `streak`): receives `scheduledWorkoutsByDate` (or `null` while it loads or after it fails, which shows a dash), and shows completed / planned for each day. The bar is the completed share of the planned count

The screen title is "Workouts" for `streak` (the Home tile keeps the label "This week"), because the screen covers 14 days. `StatBarRow` reads a missing value as "no data" in its accessibility label instead of the dash.

Both pass rows to `StatBarList`, a `Card` of `StatBarRow` rows (date label, bar, value). The date label comes from `formatShortDate` and the bar width from `barFraction`. Phase 08 puts a chart above the list (see Profile and Progress).

### Layout Clearance

The floating Coach button is 64 points (`sizes.coachButton`) and sits 16 points above the tab bar. `ActiveSessionBanner` is also `sizes.coachButton` tall and sits on the same baseline, to the left of the button, so it adds no extra height. `sizes.coachButtonClearance` (96 = 16 + 64 + 16) is therefore enough for both. Home passes it to `ScrollBox` as `contentBottomPadding`, which replaces the bottom padding of the scroll content. The last tile scrolls clear of the button and of the banner, instead of stopping above them.

### Pure Modules

These import no React Native and are covered by `bun test`:

- `src/home/chooseGreeting.ts`: the greeting line
- `src/home/carouselPageIndex.ts`: the active page from the scroll offset and the snap interval
- `src/home/todayWorkoutAction.ts`: the action button label for a workout status
- `src/stats/parseStatsMetric.ts`: the allowed metric values and the parser for the route parameter
- `src/stats/barFraction.ts`: `barFraction` (a value over a maximum, clamped to 0 to 1) and `largestValue`
- `src/progress/calculateWeeklyStreak.ts`: the weekly counts, the day states and the target rule
- `src/health/compareToAverage.ts`, `describeStepProgress.ts`, `healthRangeDatesToBackfill.ts`, `mergeHealthSnapshots.ts`: see Apple Health Integration
- `src/dates/datesBetween.ts`: every local date from a start to an end date, inclusive
- `src/dates/formatShortDate.ts`: a date as, for example, "Mon 5 Oct". `calendarNames.ts` gains the short month and weekday names it uses

`src/workouts/describeScheduledWorkout.ts` is also pure but has no test.

### Hooks

| Hook | Behaviour |
| --- | --- |
| `useProfile()` | See Profile Repository. Phase 08 widens it to the full profile |
| `useWeeklyStreak(now, weeklyWorkoutTarget)` | See Weekly Streak |
| `useHealthRange(startDate, endDate)` | See Health Range |
| `useScheduledWorkouts(startDate, endDate)` | Phase 07 adds `hasActivePlan` (whether an active plan exists, even one that starts in the future) to its ready state. `useScheduledWorkoutsForDate` returns its own ready type with `scheduledWorkouts` and `hasActivePlan`. The Calendar still uses the lookup type from `scheduledWeekCache` |

## Profile and Progress

Phase 08 turns the Profile tab into a hub, adds the profile form, the body measurements log, the Progress screens and the chart components. It adds no migration: it uses the `profile` and `body_measurements` tables from v2.

### Profile Hub

`src/app/(tabs)/profile.tsx` is a `ScrollBox` on a `SafeAreaView` with only the top edge, with 96 points of bottom clearance for the Coach button (a local constant in the route). From top to bottom:

1. `ProfileSummaryHeader`: nuggie, the display name (or "Your profile"), the goal label and weekly target, and an Edit button that opens `/profile/edit`. The stored goal `hypertrophy` is labelled "Muscle" (`fitnessGoalLabels` in `src/profile/profileLabels.ts`).
2. Body: a `SettingsRow` "Add your first measurement" (opens `/profile/measurements/new`) when there are none, otherwise "Body measurements" with the latest weight and 30-day change from `describeWeightSummary` (opens `/profile/measurements`).
3. Progress: a `SettingsRow` titled by `describeNewRecordCount` with the lifetime totals from `describeLifetimeTotals` as its subtitle (opens `/progress`). It appears once the lifetime totals have loaded.
4. "Exercise library" (opens `/exercises`) and "Apple Health" (subtitle from `describeHealthAccessStatus(...).caption`, opens `/profile/apple-health`).

There is no Notifications row; it waits for Phase 09b. Saving the profile or a measurement, and deleting a measurement, calls `bumpDataVersion()`, so Home and the hub reload.

### Routes

All are registered flat on the root `Stack` in `src/app/_layout.tsx`.

| Route | Presentation | Purpose |
| --- | --- | --- |
| `/profile/edit` | Modal | `ProfileForm` with a Save button in the header. Renders nothing until `useProfile` has loaded, and shows an `EmptyState` with a Close button when the load fails |
| `/profile/apple-health` | Push | The access status from `useHealthAuthorization` and `describeHealthAccessStatus`, a Request access button while access has not been asked for, and the steps for getting Garmin Connect to write to Apple Health |
| `/profile/measurements` | Push (`profile/measurements/index`) | The weight section (range switcher, `ProgressLineChart`, BMI caption) as the list header, then a swipe-to-delete `MeasurementRow` list. An Add button in the header opens the new-measurement sheet |
| `/profile/measurements/new` | Form sheet (detent 0.9) | `MeasurementForm` with Cancel and Save in the header |
| `/progress` | Push (`progress/index`) | `ProgressOverview` for this month, then the recent records, class counts and the searchable exercise list. Shows `NuggieLoadingScreen` (`analytics` nuggie, "Crunching your numbers") until the totals load, and an `EmptyState` when no workout has been finished |
| `/progress/records` | Push | Every personal record event, newest first, as `PersonalRecordItemRow` rows. A row opens the session summary |
| `/progress/exercises/[exerciseId]` | Push | Exercise history: a metric `SegmentedControl` (when the tracking type has more than one metric), a `RangeSwitcher`, one chart, and the `ExerciseHistoryList` of sessions. The title is the exercise name |
| `/progress/classes` | Push | One `ClassStatisticsCard` per class type |
| `/stats/[metric]` | Push (Phase 07) | Gains a chart above the 14-day list, described below |

### Charts

`victory-native` and `@shopify/react-native-skia` are imported only by three organisms: `ProgressChartFrame`, `ProgressLineChart` and `ProgressBarChart`. Every other file, including routes and pure modules, gets chart data as `ChartPoint` (`{ date, value }`, from `src/types/ChartPoint.ts`) and renders through these organisms. Pure modules must also not import either library.

- `ProgressChartFrame` is the chart-internal module shared by the other two (no route or other organism imports it). It takes `points`, `unit`, an optional `formatValue` (used by the y-axis labels and the tap and accessibility captions; without it values show with the `unit` suffix), an optional `referenceValue`, `startsAtZero`, `hasBottomPadding`, `horizontalPadding`, `selectionHint` and a `renderMarks` function. It draws the `CartesianChart` inside a `Touchable` of height `sizes.progressChartHeight`, sets the font with Skia `matchFont` on the system font (no font file is bundled), draws the dashed reference line, and handles selection.
- `ProgressLineChart` takes `points`, `unit`, an optional `referenceValue` and optional `emphasisedDates`. It draws a linear line and a dot per point; dates in `emphasisedDates` get the larger `chartEmphasisedDot`. The Y axis is fitted to the data.
- `ProgressBarChart` takes `points`, `unit` and an optional `referenceValue`. It draws columns with rounded top corners. The Y axis starts at zero. Column width is the narrower of `chartBarMaximumWidth` and `chartBarWidthRatio` times the pixels per day.
- Points are placed by real date, not by index, through `toChartDayNumber` and `fromChartDayNumber` (`src/progress/chartDayNumber.ts`). The X axis shows at most three ticks from `chartDayTicks` (first, middle and last day), labelled by `formatDayMonth`.
- Tapping selects the nearest point (`findNearestPointIndex` over the X positions) and shows its date and value in a caption above the chart. The selected point gets a `textPrimary` dot with a ring in the `surface` colour. There is no `useChartPressState`; a `Touchable` tap is used instead. The chart has `accessibilityRole="image"` and a summary label from `describeChartSummary`.
- The series colour is the `chart` token (`#E0628F` in light and dark). Grid lines use `border`, axis and reference-line text and the dashed reference line use `textSecondary`, and the frame and X axis lines are not drawn. Text never uses the chart colour. There is one series per chart, so no legend. All chart dimensions are `sizes` tokens (`progressChartHeight`, `chartLineWidth`, `chartGridLineWidth`, `chartDot`, `chartEmphasisedDot`, `chartHighlightDot`, `chartHighlightRing`, `chartEdgePadding`, `chartReferenceDash`, `chartBarMaximumWidth`, `chartBarWidthRatio`, `chartBarCornerRadius`).
- `fitValueAxis(values, { startsAtZero })` (`src/progress/fitValueAxis.ts`) returns `{ minimum, maximum, ticks }` with exactly three ticks (minimum, middle, maximum) on round steps. With `startsAtZero` the minimum is the lower of zero and the data. A flat series is widened by one. The frame includes `referenceValue` when fitting.

| Chart | Form | Y axis | Extras |
| --- | --- | --- | --- |
| Measurements: body weight (30 d, 90 d, 1 y) | Line | Fitted | Shown only with 2 or more points in range; otherwise the latest weight is shown as a number. BMI caption. Body fat and girths are never plotted |
| Exercise history: 1RM, heaviest weight, most reps, longest time, longest distance | Line | Fitted | Record dates get the larger dot |
| Exercise history: volume | Columns | From zero | None |
| Stats: steps | Columns | From zero | Dashed reference at the daily step goal |
| Stats: sleep | Columns | From zero | None |
| Stats: resting heart rate | Line | Fitted | Dashed reference at the average of the plotted days |
| Stats: streak | No chart | None | The completed / planned list is unchanged |

### Stats Detail Chart

`/stats/[metric]` now builds `healthChartPoints(metric, datesOldestFirst, snapshotsByDate)` from the same 14 days and shows the chart above `HealthMetricBarList`, inside a `Box`. The chart is skipped when there are no points. Steps use `ProgressBarChart` with `referenceValue` set to `dailyStepGoal` from `useProfile`; sleep uses `ProgressBarChart` without a reference; resting heart rate uses `ProgressLineChart` with `averageOfPoints(chartPoints)` as the reference. Sleep is plotted in hours rounded to one decimal place (`healthChartUnits` gives `steps`, `h` and `bpm`). Days without a value are left out.

### Progress Definitions

- Volume is the sum of weight times repetitions over completed `repetitions_and_weight` sets.
- Time trained is the sum of `finished_at - started_at` over finished sessions, classes included.
- "This month" is the calendar month that contains today (`currentMonthRange`). `lifetimeRange` has a `null` start date.
- The records list replays finished sessions in start order with `listPersonalRecordsFromHistory`, so each session contributes what its summary reported (`detectPersonalRecords` then `selectBestRecordPerExercise`), and an exercise's first session yields nothing. The list is newest first. `detectPersonalRecords.ts` now exports `WeightedSet` and `isWeightedSet`.
- Exercise series metrics (`src/progress/exerciseMetrics.ts`): `estimatedOneRepMax`, `heaviestWeight` and `volume` for `repetitions_and_weight`; `mostRepetitions` for `repetitions`; `longestDuration` for `duration`; `longestDistance` for `distance`. Only `volume` is a column metric. `buildExerciseSeries` keeps one point per session date with the best value, and the 1RM only counts sets of 12 repetitions or fewer.

### Component Contract Changes

- `TimePickerBox` (primitive) takes an optional `maximumDate`, passed to the date picker. `DatePickerField` (atom) uses it with `mode="date"` for the birth date and the measurement date.
- `PersonalRecordRow` keeps its compact layout (trophy icon, name and detail) when none of `imageUrl`, `recordTypeLabel` or `dateLabel` is passed, so `SessionSummary` looks as before. With any of them it draws the extended layout: exercise image (or the workout nuggie), name, `recordTypeLabel · detail`, and a `dateLabel · sessionName` caption. With `onPress` the extended row is a button.
- `ExerciseRow` takes an optional `caption` shown under the name.
- `SettingsRow` (molecule) takes `title`, an optional `subtitle` and an optional `onPress`. With `onPress` it is a button with a trailing chevron; without it, a plain row. The hub rows use only border and `textSecondary` colours, as the theme has no `textMuted` token.
- `RangeSwitcher` (molecule) is a generic wrapper over `SegmentedControl` that labels `ProgressRange` values from `progressRangeLabels` (`30 d`, `90 d`, `1 y`, `3 m`, `6 m`, `All`).
- `StatTile` is unchanged. `ProgressOverview` uses its compact layout for the four "This month" tiles.

### Hooks

| Hook | Behaviour |
| --- | --- |
| `useProfile()` | See Profile Repository |
| `useProfileForm({ initialValues, onSaved })` | Holds the form values, validates with `validateProfileForm`, and shows errors only after the first save attempt. `save()` calls `updateProfile`, bumps the data version and calls `onSaved`; a failure shows an alert |
| `useBodyMeasurements()` | `{ measurements, hasLoadFailed, removeMeasurement }`. Reloads on focus and on data version. `removeMeasurement` deletes and bumps the data version |
| `useMeasurementForm({ onSaved })` | Like `useProfileForm` for a new measurement (date defaults to today). A save-in-flight guard stops double saves |
| `useTrainingTotals(range)` | `{ totals, hasLoadFailed }` from `getTrainingTotals` |
| `usePersonalRecords()` | `{ personalRecords, hasLoadFailed }`: `listAllFinishedSessionSets` run through `buildPersonalRecordList` |
| `useNewRecordCount()` | The number of record events in the current month, or `null` while the records load or if loading failed |
| `useExercisesWithHistory()` | `{ exercises, hasLoadFailed }` from `listExercisesWithHistory` |
| `useExerciseHistory(exerciseId)` | `{ exercise, sessions, recordSetIds, recordDates, seriesSets, isLoaded, hasLoadFailed }` from `getExercise` and `listFinishedSessionSetsForExercise`, shaped by `buildExerciseHistory` |
| `useClassStatistics()` | `{ classStatistics, hasLoadFailed }` for the current month |

The data hooks reload on focus (`useFocusReloadKey`) and when the data version changes.

### Pure Modules

These import no React Native, expo-sqlite, Skia, victory-native or HealthKit code, and are covered by `bun test`.

`src/profile/`:

- `profileFormRules.ts`: the limits (height 50 to 272 cm, weekly target 1 to 14, step goal 500 to 50000 in steps of 500) and `snapStepGoal`
- `validateProfileForm.ts`: `validateProfileForm` and `toProfileUpdate`, which trims the name and stores a blank name as `null`
- `profileLabels.ts`: goal and sex labels and lists

`src/measurements/`:

- `measurementFormRules.ts`: weight 20 to 400 kg, body fat 2 to 75 %, girths 30 to 250 cm, one decimal place
- `validateMeasurementForm.ts`: `validateMeasurementForm` (at least one value, each in range, no future date) and `toBodyMeasurementInput`
- `describeBodyMeasurement.ts`: the title and detail text for a row

`src/progress/` (alongside the Phase 05 and 07 files):

- `calculateBodyMassIndex.ts`: kilograms over metres squared, one decimal place, `null` without a height
- `calculateWeightChange.ts`: `selectWeighIns` and `calculateWeightChange` (latest weight minus the weight at or just before the window start, else the oldest in the window, `null` under 2 weigh-ins or when the latest weigh-in is before the window start)
- `summarizeWeight.ts`, `describeWeightSummary.ts`, `selectWeightPoints.ts`: the hub summary and the weight chart points
- `progressRanges.ts`: `ProgressRange`, `progressRangeLabels`, `rangeStartDate` and `filterPointsToRange`
- `fitValueAxis.ts`, `chartDayNumber.ts`, `findNearestPointIndex.ts`, `describeChart.ts`: chart helpers (see Charts)
- `exerciseMetrics.ts`, `buildExerciseSeries.ts`, `buildExerciseSessions.ts`: the exercise history
- `listPersonalRecordsFromHistory.ts`, `buildPersonalRecordList.ts` (also `countPersonalRecordsInRange`), `describePersonalRecordType.ts`: the records list
- `formatTrainingTotals.ts`, `currentMonthRange.ts`: totals text and the month and lifetime ranges
- `filterExercisesByName.ts`, `sortClassStatistics.ts`, `formatClassStatistics.ts`: the exercise search and the class statistics

Elsewhere: `src/stats/healthChartPoints.ts` (`healthChartPoints`, `healthChartUnits`, `averageOfPoints`), `src/health/describeHealthAccessStatus.ts` (caption, headline and detail for the three access states) and `src/dates/formatDayMonth.ts`. New shared types are `ChartPoint`, `ClassStatistics`, `ExerciseHistory` (with `ExerciseWithHistory`), `FinishedSessionSet` and `TrainingTotals`; `BodyMeasurement.ts` gains `BodyMeasurementInput` and `WeightMeasurement`.

## Coach Nuggie

Phase 09a replaces the placeholder coach modal with a rule-based coach. It adds no migration and makes no network calls. Notifications are not part of it; they come in Phase 09b.

### Pure Coach Module

`src/coach/` is pure. It imports no React Native, expo-sqlite or expo-router code, and is covered by `bun test`. Only routes and hooks talk to the database and the router. The flow is:

1. `useCoachSnapshot` reads the repositories and hands plain results to `buildCoachSnapshot`, which returns a `CoachSnapshot`.
2. Each rule in the registry (`insightRules` in `insightRules.ts`) is a function `(snapshot) => Insight[]`.
3. `collectInsights` runs every rule, applies the `noData` exceptions, and sorts by `priority`, highest first.
4. `answerQuestion(question, snapshot)` keeps the insights whose `topics` include the question's topic, takes the first 3 (`maximumInsightsPerAnswer`) and turns them into `CoachBubble`s. With no matching insight it returns one `coach` nuggie bubble with the topic's text from `topicFallbacks`.
5. `openingBubbles(snapshot)` builds the greeting: `coachGreeting` ("Good Noop!", the same at every time of day and with or without a profile name) prefixed to the single top insight across every topic, or to `openingFallback` when there is none.
6. `chooseTipOfTheDay(snapshot)` takes the first message of the top insight that has a `recovery`, `changeItUp` or `progress` topic. Without one, `chooseGeneralTip(date)` picks from `generalTips` by day of the year.

`CoachSnapshot` holds `now`, `today`, `weekStartDate`, the profile, the active plan, `finishedSessionCount`, the finished sessions of the last 12 weeks with their sets, the personal record events of the last 14 days, the workouts scheduled this week and in the 4 weeks before it, the health snapshots of the last 14 days, the latest body measurement and the exercises by id. Weeks start on the same day as the Home streak tile (`startOfWeek`). `coachSnapshotDateRanges` computes the windows, and `groupSetsIntoSessions` groups sets into sessions.

An `Insight` has a `ruleIdentifier`, a list of `topics` (not one topic; a question matches when its topic is in the list), a `priority`, a `nuggie`, one or more `messages` and an optional `action` (`label` and `destination`). `insightToBubbles` makes one bubble per message and puts the action on the last bubble only. The five topics are `progress`, `improvement`, `changeItUp`, `recovery` and `week` (`Topic.ts`), and `coachQuestions` has one prompt chip per topic.

`plateau`, like `newPersonalRecords` and `strengthTrend`, emits one insight. Its messages cover up to 3 exercises (one per exercise, longest stall first) and its action opens the longest-stalled exercise's history.

`plateau` fires for an exercise with at least 4 sessions across at least 4 weeks (a full menstrual cycle, so one weak week cannot trigger or hide a plateau) and no rise in its metric. The metric is the best estimated 1RM, or the heaviest weight for weighted sets over 12 reps, or the best reps, duration or distance. The current sets × reps are the rounded averages over the last 3 sessions (`sessionsAveragedForCurrentTraining`), never one session. `plateauPrescription.ts` turns that into one suggestion (`describePlateauAdvice`) that branches on the profile goal (`general_fitness` and no goal use the hypertrophy ladder), with loads from the best estimated 1RM leaving 2 reps in reserve (3 when the best set was over 10 reps), rounded down to 2.5 kg, or 1 kg under 20 kg. The evidence behind the ladder is in `docs/research/plateau-progression.md`.

Messages are written in Nuggie's voice: good news is "noopy", warnings are "not noopy". Most rules have two phrasings, and `chooseVariant(snapshot.now, [first, second])` picks one by the parity of `dayOfYear` (`src/dates/dayOfYear.ts`), so an answer is stable for a day. `todaysTraining(snapshot)` returns `upcoming` (with the workout name), `trainedAlready` or `restDay`, and the recovery rules (`lowSleep`, `elevatedRestingHeartRate`, `recoveryGood`) end their message to match. `missedSessions` names the skipped workouts and the next free day this week, `muscleBalance` names up to 2 exercises from the neglected group trained in the last 12 weeks (falling back to generic ones), `noRecentWeighIn` counts the days since the last weigh-in and names the goal, `trainingLoadSpike` gives the rise as a percentage, and `stalePlan` adds a deload suggestion from 8 weeks (`deloadSuggestionWeekCount`).

Each priority is a named constant in its rule's file, and each rule file also holds that rule's thresholds as named constants.

| Priority | Rule | Topics |
| --- | --- | --- |
| 100 | `noData` | all five |
| 90 | `lowSleep` | `recovery` |
| 85 | `elevatedRestingHeartRate` | `recovery` |
| 80 | `newPersonalRecords` | `progress` |
| 70 | `missedSessions` | `week`, `improvement` |
| 65 | `trainingLoadSpike` | `recovery` |
| 60 | `plateau` | `changeItUp`, `improvement` |
| 55 | `stalePlan` | `changeItUp` |
| 50 | `streakMilestone` | `progress`, `week` |
| 45 | `muscleBalance` | `improvement` |
| 40 | `noRecentWeighIn` | `improvement` |
| 35 | `recoveryGood` | `recovery` |
| 30 | `strengthTrend` | `progress` |
| 10 | `weekAhead` | `week` |

`noData` fires when `finishedSessionCount` is below `minimumFinishedSessions` (3). When it fires, every insight is dropped except those from `noData`, `lowSleep`, `elevatedRestingHeartRate`, `recoveryGood`, `weekAhead` and `stalePlan` (`rulesShownWithoutData`), because those do not need workout history.

`CoachDestination` is a union of `exerciseHistory` (with an exercise id), `planEditor` (with a plan id), `addMeasurement`, `calendar` and `exerciseLibrary` (with a body part). The module has no route strings. `src/app/coach.tsx` maps them:

| Destination | Route |
| --- | --- |
| `exerciseHistory` | `/progress/exercises/[exerciseId]` |
| `planEditor` | `/plans/[planId]` (the active plan's id) |
| `addMeasurement` | `/profile/measurements/new` |
| `calendar` | `/calendar` (the Calendar tab, for "Today's plan" and "Open calendar") |
| `exerciseLibrary` | `/exercises?bodyPart=<bodyPart>` |

Tapping an action calls `router.dismiss()` and then `router.navigate(...)`, so the destination is not stacked under the coach modal.

Other files: `buildCoachSnapshot.ts` and `recoveryReadings.ts` (sleep and resting heart rate averages, and `restingHeartRateAverageDayCount`, shared by the recovery rules; `recoveryGood` also needs the 3-night sleep average at or above `lowSleepAverageMinutes`, so it never fires with `lowSleep`), `coachConversation.ts` (the reducer, below), `coachSettingKeys.ts`, and `coachSnapshotFixture.ts` with `coachAcceptance.test.ts`, which prove the four seeded-data cases (squat plateau, stale plan, low sleep with the `tired` nuggie, new record with the `beast` nuggie) on a pure snapshot. Nothing is seeded on the device.

### Coach Conversation

`conversationReducer` (`src/coach/coachConversation.ts`) holds `messages`, `queuedBubbles` and `nextIdentifier`. Its actions are `opened` (replaces the state with the opening bubbles queued), `questionAsked` (adds the user's prompt and queues the answer bubbles; ignored while bubbles are still queued) and `nextBubbleRevealed` (moves the first queued bubble into `messages`). `isTyping` is true while any bubble is queued.

`useCoachConversation(snapshot)` wraps the reducer. It opens once, as soon as the snapshot is not `null`, and reveals one queued bubble every `coachTypingDelayMilliseconds` (400 ms) with `setTimeout`. It returns `{ messages, isTyping, askQuestion }`. The conversation is never stored, so it starts again each time the coach opens.

### Coach Route

`/coach` is a modal (registered in the root `Stack` with title "Coach Nuggie"). It loads `useCoachSnapshot()` and renders:

- `CoachConversation` (organism): a `ScrollBox` of `UserMessageBubble` and `CoachMessageBubble` rows, each rising in with `AnimatedBox`, then a `CoachMessageBubble` holding a `TypingIndicator` while a bubble is queued. It scrolls to the end when its content grows. A bubble with an action shows it as a secondary `Button`.
- `PromptChipBar` (organism): a horizontal `ScrollBox` of `PromptChip`s, one per question in `coachQuestions`. The chips are disabled while the snapshot is loading or while an answer is typing, so a chip can't be tapped again mid-answer.
- When the snapshot fails to load, an `EmptyState` ("Coach Nuggie is stuck") with a Close button.

While the snapshot loads, the typing indicator shows. Every Nuggie bubble and the typing indicator use the `coach` nuggie (`unicorn_nuggie.webp`) as the avatar, whatever the insight's own `nuggie`.

### Tip of the Day

`useTipOfTheDay()` is called by `src/app/(tabs)/_layout.tsx` and returns the tip text, or `undefined`. On mount it decides once and never reloads on data changes: it reads `coachTipLastShownDateSettingKey` (`coach_tip_last_shown_date`) from `app_settings`; if that equals today's local date it shows nothing, otherwise it loads the snapshot once with `loadCoachSnapshot(database, now)` (in `src/hooks/loadCoachSnapshot.ts`, the plain async loader that `useCoachSnapshot` also uses), picks the tip (`chooseTipOfTheDay` when the load succeeds, `chooseGeneralTip` when it fails) and stores today's date. `useCoachSnapshot` itself still reloads on every data version change and keeps a ready snapshot if a later reload fails. So the tip shows at most once per local day. It clears the text after `durations.tipBubbleVisible` (6000 ms). `CoachFloatingButton` shows `tipText` in a bubble that is a `Touchable`, and tapping it opens the coach like the button does.

### Hooks

| Hook | Behaviour |
| --- | --- |
| `useCoachSnapshot()` | Returns `{ status: 'loading' }`, `{ status: 'failed' }` or `{ status: 'ready', snapshot }`. Reads the profile, the active plan, the lifetime totals, all finished session sets, the scheduled sessions from 4 weeks before this week to its end, the health snapshots of the last 14 days, the latest body measurement and the exercises, then calls `buildCoachSnapshot`. Reloads when the data version changes |
| `useCoachConversation(snapshot)` | See Coach Conversation |
| `useTipOfTheDay()` | See Tip of the Day |

### Components

| Component | Purpose |
| --- | --- |
| `PulseBox` (primitive) | An `Animated.View` that loops its opacity between 0.3 and 1. Takes `pulseDuration` and an optional `delay` |
| `TypingIndicator` (atom) | Three `PulseBox` dots in a surface bubble, staggered, with the label "Coach Nuggie is typing" |
| `CoachMessageBubble` (molecule) | The `coach` `NuggieImage` avatar beside a bubble with text and an optional action `Button`. Takes `children` in place of the bubble, which the typing state uses |
| `UserMessageBubble` (molecule) | Right-aligned accent bubble with the user's prompt |
| `PromptChip` (molecule) | A pill-shaped prompt button with an accent border. Takes `disabled` |
| `CoachConversation` (organism) | See Coach Route |
| `PromptChipBar` (organism) | See Coach Route |

`ScrollBox` now takes a `ref` (typed `Ref<ScrollView>`) and exports `ScrollBoxHandle`, so `CoachConversation` can call `scrollToEnd`. `CoachFloatingButton` already took `tipText`; the bubble is now tappable.

### New Theme Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `sizes.coachAvatar` | 36 | Size of the nuggie beside a coach bubble |
| `sizes.typingDot` | 8 | Diameter of a typing indicator dot |
| `sizes.chatBubbleMaximumWidth` | 300 | Maximum width of a coach or user bubble |
| `durations.typingDotPulse` | 400 | Length of one fade in the typing dots |
| `durations.typingDotStagger` | 150 | Delay between neighbouring typing dots |
| `durations.tipBubbleVisible` | 6000 | How long the tip bubble stays before hiding itself |

## Notifications

Phase 09b adds local notifications with `expo-notifications`. There is no push server.

The `expo-notifications` config plugin is deliberately left out of app.json. It always adds the push `aps-environment` entitlement, which the free Personal Team can't sign. Local notifications don't need it, and the native module autolinks without the plugin.

### Module Boundary

`src/notifications/` is the only place that imports `expo-notifications`, following the Apple Health precedent. Four adapter files import it:

| File | Purpose |
| --- | --- |
| `notificationPermission.ts` | `getNotificationPermissionStatus()` reads `undetermined`, `granted` or `denied` without prompting. `requestNotificationPermission()` returns `granted` or `denied` and asks iOS only when permission has not been decided |
| `notificationScheduling.ts` | `schedulePlannedNotification(plannedNotification)` schedules a DATE trigger with the content, the sound choice and `data.route`. `cancelPendingNotificationsWithIdentifierPrefix(identifierPrefix)` cancels the pending requests whose identifier starts with the prefix |
| `notificationHandler.ts` | `configureNotificationHandler()`, called at module scope in the root layout, picks the foreground presentation from the identifier's kind |
| `notificationTaps.ts` | `takeLastNotificationTap()` reads and clears the response that opened the app, and `subscribeToNotificationTaps(listener)` follows later taps. Both give a `NotificationTap` (`identifier`, `route`) and ignore a response they have already handled |

### Pure Modules

- `notificationSettingKeys.ts`: `workout_reminders_enabled`, `reminder_lead_minutes`, `rest_alerts_enabled` and `weekly_summary_enabled`, with the `true` and `false` values
- `NotificationSettings.ts` and `parseNotificationSettings.ts`: every toggle defaults to on, and the lead time is 15, 30 or 60 minutes, defaulting to 30
- `notificationIdentifiers.ts`: the `workout-reminder:` prefix, `workoutReminderIdentifier(date, planEntryId)` and `notificationKindForIdentifier`
- `foregroundPresentation.ts`: banner, list and sound per notification kind
- `PlannedNotification.ts`: identifier, title, body, nuggie, route, fire time and whether it plays a sound
- `buildWorkoutReminders.ts`: one reminder per planned workout with a time of day in the 14-day window (today and the 13 days after), firing at its time minus the lead time when that is still in the future. The title is "Noop noop! 🦄", the body reads "Push Day at 17:30 — Nuggie's ready when you are!", the nuggie is `notification`, and the route is the workout detail from `resolveScheduledWorkoutRoute` as a string
- `workoutReminderWindow.ts`, `routeToHref.ts`, `readNotificationRoute.ts`, `createQueuedRunner.ts` (one run at a time, with at most one queued rerun, passing failures to an `onError` callback) and `notificationsConfiguration.ts`

### Reconciling

`useNotificationReconciler()` runs `reconcileNotifications(database)` on mount, when the app returns to the foreground and 2 seconds after the last data version bump, through one queued runner. Each run loads the settings, reads the permission status (it never prompts), then reads the current time (so a long first-launch prompt can't leave a past fire time) and, for each scheduled kind, cancels the pending requests with that kind's prefix, deletes its future rows, then schedules each planned notification again and upserts its row. Each notification is scheduled on its own: a failure is reported with `reportNotificationError` (a `console.warn` in `__DEV__`), its row is not written, and the rest still go ahead. Without granted permission, nothing is scheduled.

### Permission Sheet

The route `notifications/permission` is a `formSheet` that renders the `NotificationPermissionSheet` organism: the `notification` nuggie, a short explanation, "Sounds noopy!" and "Not now". `useNotificationPermissionSheet()` on Home opens it once, on the first visit, when the `notification_permission_sheet_shown_at` setting is empty and iOS permission is still undetermined (`shouldShowNotificationPermissionSheet`). The setting is written when the sheet opens. "Sounds noopy!" calls `requestNotificationPermission()`, closes the sheet and bumps the data version so the reconciler schedules; "Not now" only closes it.

### Tap Routing

`useNotificationTapRouting()` handles the response that opened the app, then listens for taps. Each tap marks the row with that identifier read, bumps the data version and pushes the route from the content data. Both hooks are mounted once by `NotificationServices` in the root layout, inside `SQLiteProvider` and after the `Stack`.

### Rest Alert

`useRestAlertScheduling()` subscribes to `restTimerStore` and is mounted by `NotificationServices` alongside the other two hooks, so the session hooks are untouched. Each store change goes through the pure `mapRestTimerChange(previousState, nextState, nowMilliseconds)`: a running timer gives `schedule` with the seconds left (the full rest on start, the time left on resume), a pause, clear or natural end gives `cancel`, and idle staying idle gives `nothing`. Under one second also cancels, since `TIME_INTERVAL` needs at least 1.

Actions run one after another on a promise chain. A schedule action loads the settings, skips when `areRestAlertsEnabled` is off or permission is not granted, reads the in-progress session with `getActiveSession` to build `/sessions/<id>` (no route if there is none), then checks the timer state is still the one that triggered it before calling `scheduleRestTimerNotification(seconds, sessionRoute)`. `cancelRestTimerNotification()` cancels the fixed identifier `rest-timer:alert`, so scheduling again replaces it. The alert is a `TIME_INTERVAL` trigger with no sound, titled "Noop noop! 🦄" with the body "Rest's up! Back to it 💪". It is never upserted into the `notifications` table. `foregroundPresentationFor('restTimer')` hides it in the foreground (no banner, list or sound).

## App Start

When the app launches:

1. The native splash screen stays up because the root layout calls `SplashScreen.preventAutoHideAsync()` at module scope.
2. `NuggieLoadingScreen` appears as an overlay (sky-blue background, 180-point centred nuggie image, caption) and hides the native splash on its first layout. The nuggie is chosen by `chooseNuggie({ kind: 'appLoading' }, new Date())` to match the hour of day (sleeping 22–04, early morning 05–07, workout 08–21).
3. The `SQLiteProvider` (with `useSuspense`) runs its `onInit` function: migrations execute against the database, driven by `PRAGMA user_version`.
4. Once the database is ready and the minimum 800ms has elapsed, the loading screen hides and the tab navigation appears.
5. Four tabs occupy the bottom: Home, Calendar, Create, Profile. The `CoachFloatingButton` (64-point circle with a 3-point accent ring) floats in the bottom-right, 16 points from each edge, above the tab bar. Tapping it opens the coach modal. The tabs layout also calls `useTipOfTheDay()` and passes the result to the button as `tipText` (see Coach Nuggie).

The root layout nests `ThemeProvider` → `Suspense` (null fallback) → `SQLiteProvider` → `GestureHandlerRootView` → `Stack`. The loading screen is a sibling overlay inside `ThemeProvider`, so the tabs mount underneath while it is still showing.

## Directory Layout

```
src/
  app/                      Expo Router routes and layouts
    (tabs)/                 bottom tabs: index, calendar, create, profile
    _layout.tsx             root: ThemeProvider → Suspense → SQLiteProvider → GestureHandlerRootView → Stack
    coach.tsx               Coach modal screen: conversation, prompt chips, action routing
    exercises/              library (index), new, [exerciseId] edit, picker
    workouts/               builder: _layout with WorkoutEditorProvider, new, class-details, editor, [workoutId]/edit, superset-info
    plans/                  new, [planId] editor, [planId]/add-entry, entry-time, activate, copy-day
    workout/                [workoutId] detail screen
    stats/                  [metric] 14-day detail screen with chart
    profile/                edit, apple-health, measurements/index, measurements/new
    progress/               index, records, classes, exercises/[exerciseId]
    sessions/               [sessionId] logger, finishing, summary screens, [sessionId]/link-health-workout sheet
  components/
    primitives/             themed wrappers: Box, Typography, Touchable, TextField, Stack, Image, Icon, List, SectionedList, ScrollBox, AnimatedBox, SwipeableBox, LongPressDragBox, WindowMeasuredBox, TimePickerBox, PagedList, SnapList, ProgressRingBox, ShakeBox, PulseBox
    atoms/                  smallest UI pieces: Button, TextButton, IconButton, Badge, Chip, Checkbox, NuggieImage, Card, NumberInput, DurationInput, DragHandle, SupersetBracket, Toast, TimeLabel, StatusChip, DayMarker, PageDots, StreakDots, TrendArrow, DatePickerField, TypingIndicator
    molecules/              small grouped atoms: CoachFloatingButton, ScreenHeader, EmptyState, ChipGroup, SegmentedControl, SearchBar, AlphabetIndex, ExerciseRow, FormField, ImageUrlField, Stepper, KindChoiceCard, ActionCard, TargetSetRow, TargetSetTable, WorkoutRow, WorkoutNameField, PlanEntryRow, DaySectionHeader, PlanRow, RestDay, ActivePlanBanner, DayChip, ScheduledWorkoutCard, HeaderImageCard, WorkoutDetailExerciseRow, ActiveSessionBanner, PersonalRecordRow, RestTimerBar, SessionSetRow, SessionTopBar, StatTile, HealthPermissionCard, HealthWorkoutRow, LinkedHealthWorkoutRow, HealthSuggestionBanner, GreetingHeader, TodayWorkoutCard, NuggieActionCard, RestDayCard, NoPlanCard, WeeklyStreakTile, StatBarRow, ProfileSummaryHeader, SettingsRow, MeasurementRow, RangeSwitcher, ClassCountTile, StatisticLine, CoachMessageBubble, UserMessageBubble, PromptChip
    organisms/              self-contained sections: NuggieLoadingScreen, ExerciseForm, ExercisePicker, ExerciseEditorCard, ReorderableExerciseList, ClassDetailsForm, CreateHub, WorkoutEditorFooter, PlanWeekEditor, AddPlanEntrySheet, ActivatePlanSheet, EntryTimeSheet, CopyDaySheet, WeekStrip, DayWorkoutList, IndividualWorkoutDetail, ClassWorkoutDetail, SessionLogger, ClassSessionView, SessionExerciseCard, SessionSummary, LinkHealthWorkoutSheet, TodayCarousel, StatTileGrid, StatBarList, HealthMetricBarList, StreakBarList, ProfileForm, MeasurementForm, ProgressOverview, RecentRecordsSection, PersonalRecordItemRow, ClassCountSection, ClassStatisticsCard, ExerciseProgressSection, ExerciseHistoryList, ProgressChartFrame, ProgressLineChart, ProgressBarChart, CoachConversation, PromptChipBar
  database/
    migrations/             schema: createInitialSchema (v1 draft, unedited), createTrainingSchema (v2), addSessionExerciseRestSeconds (v3), addNotificationIdentifier (v4)
    repositories/           one file per entity: exerciseRepository, workoutRepository, planRepository, scheduleRepository, sessionRepository, appSettingsRepository, healthSnapshotRepository, profileRepository, bodyMeasurementRepository, progressRepository, notificationRepository
  exercises/                pure exercise logic with tests: validation, A–Z grouping, filtering, selection, body part param parsing
  hooks/                    data hooks that reload on focus: useExercises, useExercise, useRecentlyUsedExercises, useExerciseForm, useWorkouts, useWorkoutWithItems, useWorkoutEditor, useWorkoutActions, useExercisePicks, useSaveWorkout, useUnsavedChangesGuard, useReorderingSheetLock, useWorkoutSavedNoticeOnFocus, usePlans, usePlan, usePlanActions, useScheduledWorkouts, useWeekPages, useSelectedDate, useScheduledWeeks, useSession, useStartSession, useActiveSession, useFinishedSession, useRestTimer, useSessionExercisePicks, useHealthAuthorization, useDailyHealth, useOverlappingHealthWorkouts, useUnlinkHealthWorkout, useProfile, useWeeklyStreak, useHealthRange, useFocusReloadKey, useProfileForm, useBodyMeasurements, useMeasurementForm, useTrainingTotals, usePersonalRecords, useNewRecordCount, useExercisesWithHistory, useExerciseHistory, useClassStatistics, useCoachSnapshot, useCoachConversation, useTipOfTheDay
  stores/                   exercisePickerStore, workoutSavedStore for returning values between screens; dataVersionStore, restTimerStore for module-level state; with tests
  plans/                    pure plan logic with tests: build scheduled workouts, time of day, summaries, copy day, weekday grouping, day marker state, week cache
  workouts/                 pure builder logic with tests: reducer, normalisation, grouping blocks, target set columns, save rows, drag maths, rest presets, class type nuggies, editor context and provider, duration estimation, target set descriptions
  sessions/                 pure session logic with tests: start and resume rules, fill and change operations, rest timer control, finishing and discard logic, personal record detection
  progress/                 personal record detection (record types, first-time rule, tie handling, superset and best-set logic), the weekly streak (phase 07), and totals, weight, records list, exercise series and chart helpers (phase 08)
  profile/                  pure profile logic with tests: form rules, validation, labels (phase 08)
  measurements/             pure measurement logic with tests: form rules, validation, row text (phase 08)
  home/                     pure Home logic with tests: greeting, carousel page index, today workout action label (phase 07)
  stats/                    pure detail screen logic with tests: metric parsing, bar fractions (phase 07), chart points (phase 08)
  numbers/                  pure number parsing with tests: textual input rules
  images/                   pure image URL validation with tests: error messages
  nuggies/                  nuggie selection and image system
  dates/                    pure date/duration helpers with tests: week paging, calendar names, formatted dates, date ranges
  types/                    shared domain types (Exercise, Workout, Session, Plan, ScheduledWorkout, etc.)
  theme/                    design tokens and theme provider
  health/                   Apple Health integration (phase 06); range backfill, trend and step progress helpers (phase 07)
  coach/                    pure coach logic with tests (phase 09a): snapshot, rule registry and rules/, answers, greeting, tip of the day, conversation reducer. No React Native, expo-sqlite or expo-router imports
  notifications/            local notifications (phase 09b): expo-notifications adapters, settings, reminder builder and identifiers
```

**Note on typed routes:** Expo Router generates TypeScript types for file-based routes into `.expo/types/router.d.ts` during `npx expo start` on the development machine. A fresh checkout needs one dev-server start before `bun run typecheck` accepts new route references.

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

### HealthKit signing (2026-10-05)

- Outcome: the free personal team (Hayley Dodkins (Personal Team)) signs the HealthKit capability. Xcode Signing & Capabilities shows HealthKit with no capability error, `bun run device` installs the app, and the Apple Health permission sheet appears and can be granted. `ios/Cookiejar/Cookiejar.entitlements` contains `com.apple.developer.healthkit`.
- Library pin: `@kingstinct/react-native-healthkit` is pinned exactly at `15.1.0`. Version 16.0.0 fails to build on Expo 57 / React Native 0.86 (issue #391, fix in PR #395 unreleased as of 2026-10-05). Move up once a fixed 16.x ships.
- One-time Mac setup that the first device build needed:
  1. "No code signing certificates are available to use": in Xcode → Settings → Accounts, add the Apple ID, select the Personal Team, Manage Certificates, then + Apple Development.
  2. "Your team has no devices from which to generate a provisioning profile": open `ios/Cookiejar.xcworkspace`, choose the connected iPhone as the run destination, and click Try Again under Signing.
  3. Repeated "codesign wants to access key" prompts, one per signed framework: run `security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k <mac password> ~/Library/Keychains/login.keychain-db`. Clear stuck prompts with `killall SecurityAgent`.
