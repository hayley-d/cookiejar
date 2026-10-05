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
| SVG | `react-native-svg` for the progress ring in class session view (used only in the `ProgressRingBox` primitive) |
| Date/time picker | `@react-native-community/datetimepicker` (native platform pickers for time and date selection) |
| Apple Health | `@kingstinct/react-native-healthkit`, pinned exactly at `15.1.0`, with `react-native-nitro-modules` (`0.37.1`) as its native bridge |
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
| `countPlansUsingWorkout(database, workoutId)` | Counts the distinct plans that reference the workout in their `plan_entries`, for the delete warning |

### Migrations

Migrations run in order through `src/database/migrations/migrations.ts` array: `[createInitialSchema, createTrainingSchema, addSessionExerciseRestSeconds]`. The `user_version` PRAGMA tracks which migrations have run.

- **v1 (createInitialSchema)**: Draft schema with exercises, workouts, workout_exercises and sets tables. Never edited. Kept so the migration order stays the same on every device.
- **v2 (createTrainingSchema)**: Drops draft tables and creates the full training schema for production use.
- **v3 (addSessionExerciseRestSeconds)**: Adds `rest_seconds` column to `session_exercises` table to allow per-session rest customization.

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
| **primitives** | Thin themed wrappers over React Native elements. The only layer that touches raw `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, `FlatList`, `SectionList`, `expo-image`, `expo-symbols`, `react-native-svg` and `@react-native-community/datetimepicker`. They apply theme tokens and nothing else. | `Box`, `Typography`, `Touchable`, `TextField`, `Stack`, `Image`, `Icon`, `List`, `SectionedList`, `ScrollBox`, `AnimatedBox`, `SwipeableBox`, `LongPressDragBox`, `WindowMeasuredBox`, `TimePickerBox`, `ProgressRingBox`, `ShakeBox` |
| **atoms** | The smallest pieces of UI with meaning, built from primitives. No data access. | `Button`, `TextButton`, `IconButton`, `Badge`, `Chip`, `Checkbox`, `NuggieImage`, `Card`, `NumberInput`, `DurationInput`, `DragHandle`, `SupersetBracket`, `Toast`, `TimeLabel`, `StatusChip`, `DayMarker`, `CountdownButton`, `ElapsedTimer` |
| **molecules** | Small groups of atoms that work as a unit. Hold local UI state at most. | `CoachFloatingButton`, `ScreenHeader`, `EmptyState`, `ChipGroup`, `SegmentedControl`, `SearchBar`, `AlphabetIndex`, `ExerciseRow`, `FormField`, `ImageUrlField`, `Stepper`, `KindChoiceCard`, `ActionCard`, `TargetSetRow`, `TargetSetTable`, `WorkoutRow`, `WorkoutNameField`, `PlanEntryRow`, `DaySectionHeader`, `PlanRow`, `RestDay`, `ActivePlanBanner`, `DayChip`, `ScheduledWorkoutCard`, `HeaderImageCard`, `WorkoutDetailExerciseRow`, `ActiveSessionBanner`, `PersonalRecordRow`, `RestTimerBar`, `SessionSetRow`, `SessionTopBar`, `StatTile` |
| **organisms** | Self-contained sections of a screen. Receive data and callbacks through props. | `NuggieLoadingScreen`, `ExerciseForm`, `ExercisePicker`, `ExerciseEditorCard`, `ReorderableExerciseList`, `ClassDetailsForm`, `CreateHub`, `WorkoutEditorFooter`, `PlanWeekEditor`, `AddPlanEntrySheet`, `ActivatePlanSheet`, `EntryTimeSheet`, `CopyDaySheet`, `WeekStrip`, `DayWorkoutList`, `IndividualWorkoutDetail`, `ClassWorkoutDetail`, `SessionLogger`, `ClassSessionView`, `SessionExerciseCard`, `SessionSummary` |
| **routes** | Expo Router screens. Load data through repositories and hooks, then compose organisms. | `src/app/(tabs)/index.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/coach.tsx`, `src/app/exercises/*`, `src/app/workouts/*`, `src/app/plans/*`, `src/app/workout/[workoutId].tsx`, `src/app/sessions/[sessionId]/index.tsx`, `src/app/sessions/[sessionId]/finishing.tsx`, `src/app/sessions/[sessionId]/summary.tsx` |

Rules:

- Only routes and hooks talk to the database. Components below routes are given data through props, which keeps them easy to reuse and preview.
- Colours, spacing, radii, sizes, durations and typography come from `src/theme` tokens. No hard-coded values in components. Fixed dimensions (image and icon sizes, column widths, clearances, drag geometry) live in `theme.sizes`.
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

Plan-specific hooks reload on focus. Their write functions call repository functions, then call `bumpDataVersion()`, which triggers `useScheduledWorkouts` to recompute:

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

`useFinishedSession(sessionId)` loads once per sessionId (does not reload on focus). It loads the finished session with `getSessionWithExercises`, then calls `listCompletedSetsForExercises(database, exerciseIds, session.startedAt)` to get completed sets from finished sessions that started earlier. It detects personal records by calling `detectPersonalRecords(currentSets, earlierSets)`. Current sets come from the finished session, flattened with `flattenCompletedSets`.

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
| `useFinishedSession(sessionId)` | Returns `{ status: 'loading' } \| { status: 'missing' } \| { status: 'failed' } \| { status: 'found', session, personalRecords }`. Loads once per sessionId with `getSessionWithExercises`, calls `listCompletedSetsForExercises` to load earlier sets, then detects records with `detectPersonalRecords`. Does not reload on focus |
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
    plans/                  new, [planId] editor, [planId]/add-entry, entry-time, activate, copy-day
    workout/                [workoutId] detail screen
    sessions/               [sessionId] logger, finishing, summary screens
  components/
    primitives/             themed wrappers: Box, Typography, Touchable, TextField, Stack, Image, Icon, List, SectionedList, ScrollBox, AnimatedBox, SwipeableBox, LongPressDragBox, WindowMeasuredBox, TimePickerBox, PagedList, ProgressRingBox, ShakeBox
    atoms/                  smallest UI pieces: Button, TextButton, IconButton, Badge, Chip, Checkbox, NuggieImage, Card, NumberInput, DurationInput, DragHandle, SupersetBracket, Toast, TimeLabel, StatusChip, DayMarker
    molecules/              small grouped atoms: CoachFloatingButton, ScreenHeader, EmptyState, ChipGroup, SegmentedControl, SearchBar, AlphabetIndex, ExerciseRow, FormField, ImageUrlField, Stepper, KindChoiceCard, ActionCard, TargetSetRow, TargetSetTable, WorkoutRow, WorkoutNameField, PlanEntryRow, DaySectionHeader, PlanRow, RestDay, ActivePlanBanner, DayChip, ScheduledWorkoutCard, HeaderImageCard, WorkoutDetailExerciseRow, ActiveSessionBanner, PersonalRecordRow, RestTimerBar, SessionSetRow, SessionTopBar, StatTile
    organisms/              self-contained sections: NuggieLoadingScreen, ExerciseForm, ExercisePicker, ExerciseEditorCard, ReorderableExerciseList, ClassDetailsForm, CreateHub, WorkoutEditorFooter, PlanWeekEditor, AddPlanEntrySheet, ActivatePlanSheet, EntryTimeSheet, CopyDaySheet, WeekStrip, DayWorkoutList, IndividualWorkoutDetail, ClassWorkoutDetail, SessionLogger, ClassSessionView, SessionExerciseCard, SessionSummary
  database/
    migrations/             schema: createInitialSchema (v1 draft, unedited), createTrainingSchema (v2), addSessionExerciseRestSeconds (v3)
    repositories/           one file per entity: exerciseRepository, workoutRepository, planRepository, scheduleRepository, sessionRepository
  exercises/                pure exercise logic with tests: validation, A–Z grouping, filtering, selection
  hooks/                    data hooks that reload on focus: useExercises, useExercise, useRecentlyUsedExercises, useExerciseForm, useWorkouts, useWorkoutWithItems, useWorkoutEditor, useWorkoutActions, useExercisePicks, useSaveWorkout, useUnsavedChangesGuard, useReorderingSheetLock, useWorkoutSavedNoticeOnFocus, usePlans, usePlan, usePlanActions, useScheduledWorkouts, useWeekPages, useSelectedDate, useScheduledWeeks, useSession, useStartSession, useActiveSession, useFinishedSession, useRestTimer, useSessionExercisePicks
  stores/                   exercisePickerStore, workoutSavedStore for returning values between screens; dataVersionStore, restTimerStore for module-level state; with tests
  plans/                    pure plan logic with tests: build scheduled workouts, time of day, summaries, copy day, weekday grouping, day marker state, week cache
  workouts/                 pure builder logic with tests: reducer, normalisation, grouping blocks, target set columns, save rows, drag maths, rest presets, class type nuggies, editor context and provider, duration estimation, target set descriptions
  sessions/                 pure session logic with tests: start and resume rules, fill and change operations, rest timer control, finishing and discard logic, personal record detection
  progress/                 personal record detection: record types, first-time rule, tie handling, superset and best-set logic
  numbers/                  pure number parsing with tests: textual input rules
  images/                   pure image URL validation with tests: error messages
  nuggies/                  nuggie selection and image system
  dates/                    pure date/duration helpers with tests: week paging, calendar names, formatted dates
  types/                    shared domain types (Exercise, Workout, Session, Plan, ScheduledWorkout, etc.)
  theme/                    design tokens and theme provider
  health/                   Apple Health integration (phase 06)
  coach/                    Coach logic and screens (phase 09)
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

- Outcome: not yet determined. `expo prebuild` generated `ios/Cookiejar/Cookiejar.entitlements` with `com.apple.developer.healthkit` and the `NSHealthShareUsageDescription` string. `bun run device` could not run because no physical iPhone was connected (only simulators were available), so whether the free personal team signs the HealthKit capability is still to be confirmed on the phone.
- Library pin: `@kingstinct/react-native-healthkit` is pinned exactly at `15.1.0`. Version 16.0.0 fails to build on Expo 57 / React Native 0.86 (issue #391, fix in PR #395 unreleased as of 2026-10-05). Move up once a fixed 16.x ships.
