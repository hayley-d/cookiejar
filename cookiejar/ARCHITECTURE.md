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
| Date/time picker | `@react-native-community/datetimepicker` (native platform pickers for time and date selection) |
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
| **primitives** | Thin themed wrappers over React Native elements. The only layer that touches raw `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, `FlatList`, `SectionList`, `expo-image`, `expo-symbols` and `@react-native-community/datetimepicker`. They apply theme tokens and nothing else. | `Box`, `Typography`, `Touchable`, `TextField`, `Stack`, `Image`, `Icon`, `List`, `SectionedList`, `ScrollBox`, `AnimatedBox`, `SwipeableBox`, `LongPressDragBox`, `WindowMeasuredBox`, `TimePickerBox` |
| **atoms** | The smallest pieces of UI with meaning, built from primitives. No data access. | `Button`, `TextButton`, `IconButton`, `Badge`, `Chip`, `Checkbox`, `NuggieImage`, `Card`, `NumberInput`, `DurationInput`, `DragHandle`, `SupersetBracket`, `Toast`, `TimeLabel` |
| **molecules** | Small groups of atoms that work as a unit. Hold local UI state at most. | `CoachFloatingButton`, `ScreenHeader`, `EmptyState`, `ChipGroup`, `SegmentedControl`, `SearchBar`, `AlphabetIndex`, `ExerciseRow`, `FormField`, `ImageUrlField`, `Stepper`, `KindChoiceCard`, `ActionCard`, `TargetSetRow`, `TargetSetTable`, `WorkoutRow`, `WorkoutNameField`, `PlanEntryRow`, `DaySectionHeader`, `PlanRow`, `RestDay`, `ActivePlanBanner` |
| **organisms** | Self-contained sections of a screen. Receive data and callbacks through props. | `NuggieLoadingScreen`, `ExerciseForm`, `ExercisePicker`, `ExerciseEditorCard`, `ReorderableExerciseList`, `ClassDetailsForm`, `CreateHub`, `WorkoutEditorFooter`, `PlanWeekEditor`, `AddPlanEntrySheet`, `ActivatePlanSheet`, `EntryTimeSheet`, `CopyDaySheet` |
| **routes** | Expo Router screens. Load data through repositories and hooks, then compose organisms. | `src/app/(tabs)/index.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/coach.tsx`, `src/app/exercises/*`, `src/app/workouts/*`, `src/app/plans/*` |

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

`src/stores/dataVersionStore.ts` is a module-level counter with `bumpDataVersion()`, `subscribeToDataVersion(listener)`, `getDataVersion()`, `resetDataVersion()` and `useDataVersion()` hook. It is bumped in hooks immediately after their repository writes: `usePlans.createPlan`, `usePlan.addPlanEntry`, `usePlan.updatePlanEntryTime`, `usePlan.removePlanEntry`, `usePlan.copyDay`, `usePlan.renamePlan`, `usePlan.duplicatePlan`, `usePlan.deletePlan`, `usePlan.activatePlan`, `usePlan.deactivatePlan`, `useSaveWorkout`, and `useWorkoutActions.deleteWorkout`, because all of these change what is scheduled. `useScheduledWorkouts` reads the version with `useDataVersion()` and recomputes the schedule when it bumps.

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

The Calendar tab is registered in `src/app/(tabs)/calendar.tsx`. Tapping a day's workout card pushes the detail route.

| Route | Presentation | Purpose |
| --- | --- | --- |
| `/(tabs)/calendar` | Tab | The calendar week strip with the selected day's workouts in time order |
| `/workout/[workoutId]` | Stack push | Workout detail, with optional `date` and `planEntryId` params. Switches on `kind` (individual or class). Loading, missing and failed states show `EmptyState`. Edit pushes the builder edit modal (`/workouts/[workoutId]/edit`). Start opens a Phase 05 placeholder alert |

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

### Placeholder for Phase 05

`src/workouts/startWorkout.ts` exports `startWorkout({ workoutId, date, planEntryId })`, which shows an alert saying "Workout sessions arrive in Phase 05". Phase 05 replaces this function with the actual session creation flow.

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
| `DayWorkoutList` (organism) | The workouts for the selected day. Cards tap through to the detail route and the play button calls `startWorkout`. An empty day shows the rest-day nuggie and a "Browse workouts" button that navigates to Create. Loading and failed states show a message |
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
  components/
    primitives/             themed wrappers: Box, Typography, Touchable, TextField, Stack, Image, Icon, List, SectionedList, ScrollBox, AnimatedBox, SwipeableBox, LongPressDragBox, WindowMeasuredBox, TimePickerBox, PagedList
    atoms/                  smallest UI pieces: Button, TextButton, IconButton, Badge, Chip, Checkbox, NuggieImage, Card, NumberInput, DurationInput, DragHandle, SupersetBracket, Toast, TimeLabel, StatusChip, DayMarker
    molecules/              small grouped atoms: CoachFloatingButton, ScreenHeader, EmptyState, ChipGroup, SegmentedControl, SearchBar, AlphabetIndex, ExerciseRow, FormField, ImageUrlField, Stepper, KindChoiceCard, ActionCard, TargetSetRow, TargetSetTable, WorkoutRow, WorkoutNameField, PlanEntryRow, DaySectionHeader, PlanRow, RestDay, ActivePlanBanner, DayChip, ScheduledWorkoutCard, HeaderImageCard, WorkoutDetailExerciseRow
    organisms/              self-contained sections: NuggieLoadingScreen, ExerciseForm, ExercisePicker, ExerciseEditorCard, ReorderableExerciseList, ClassDetailsForm, CreateHub, WorkoutEditorFooter, PlanWeekEditor, AddPlanEntrySheet, ActivatePlanSheet, EntryTimeSheet, CopyDaySheet, WeekStrip, DayWorkoutList, IndividualWorkoutDetail, ClassWorkoutDetail
  database/
    migrations/             schema: createInitialSchema (v1 draft, unedited), createTrainingSchema (v2)
    repositories/           one file per entity: exerciseRepository, workoutRepository, planRepository, scheduleRepository
  exercises/                pure exercise logic with tests: validation, A–Z grouping, filtering, selection
  hooks/                    data hooks that reload on focus: useExercises, useExercise, useRecentlyUsedExercises, useExerciseForm, useWorkouts, useWorkoutWithItems, useWorkoutEditor, useWorkoutActions, useExercisePicks, useSaveWorkout, useUnsavedChangesGuard, useReorderingSheetLock, useWorkoutSavedNoticeOnFocus, usePlans, usePlan, usePlanActions, useScheduledWorkouts, useWeekPages, useSelectedDate, useScheduledWeeks
  stores/                   exercisePickerStore and workoutSavedStore for returning values between screens, dataVersionStore, with tests
  plans/                    pure plan logic with tests: build scheduled workouts, time of day, summaries, copy day, weekday grouping, day marker state, week cache
  workouts/                 pure builder logic with tests: reducer, normalisation, grouping blocks, target set columns, save rows, drag maths, rest presets, class type nuggies, editor context and provider, duration estimation, target set descriptions, start workout placeholder
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
