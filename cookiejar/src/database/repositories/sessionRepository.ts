import type { SQLiteDatabase } from 'expo-sqlite';

import { isRequestForActiveSession } from '@/sessions/resolveStartAgainstActiveSession';
import { resolveSessionStart, type ExistingPlanEntrySession } from '@/sessions/resolveSessionStart';
import type { CompletedSet } from '@/progress/detectPersonalRecords';
import type { PreviousSessionSet } from '@/sessions/describePreviousSet';
import type { SetValues } from '@/sessions/fillSetForTick';
import { normaliseSessionExercises } from '@/sessions/normaliseSessionExercises';
import { actualValuesAfterReplace, resolveReplacedExerciseId } from '@/sessions/replaceExercise';
import type { ActiveSession } from '@/types/ActiveSession';
import type { ClassType } from '@/types/ClassType';
import type { SessionSet } from '@/types/SessionSet';
import type { SessionExerciseWithSets, SessionWithExercises } from '@/types/SessionWithExercises';
import type { TrackingType } from '@/types/TrackingType';
import type { WorkoutKind } from '@/types/WorkoutKind';

export type SessionStartRequest = {
  workoutId: number;
  scheduledDate: string;
  planEntryId: number | null;
};

type WorkoutSnapshotRow = {
  name: string;
  kind: WorkoutKind;
  class_type: ClassType | null;
};

export class ActiveSessionExistsError extends Error {
  constructor() {
    super('Another workout session is already open');
    this.name = 'ActiveSessionExistsError';
  }
}

type ActiveSessionRow = {
  id: number;
  workout_id: number | null;
  plan_entry_id: number | null;
  workout_name: string;
  scheduled_date: string;
  started_at: string;
};

function toActiveSession(row: ActiveSessionRow): ActiveSession {
  return {
    id: row.id,
    workoutId: row.workout_id,
    planEntryId: row.plan_entry_id,
    workoutName: row.workout_name,
    scheduledDate: row.scheduled_date,
    startedAt: row.started_at,
  };
}

const selectActiveSessionSql = `SELECT id, workout_id, plan_entry_id, workout_name, scheduled_date, started_at
  FROM sessions WHERE finished_at IS NULL ORDER BY started_at, id LIMIT 1`;

export async function getActiveSession(database: SQLiteDatabase): Promise<ActiveSession | null> {
  const row = await database.getFirstAsync<ActiveSessionRow>(selectActiveSessionSql);
  return row === null ? null : toActiveSession(row);
}

type ExistingSessionRow = {
  id: number;
  finished_at: string | null;
};

type SessionRow = {
  id: number;
  workout_id: number | null;
  plan_entry_id: number | null;
  workout_name: string;
  workout_kind: WorkoutKind;
  class_type: ClassType | null;
  scheduled_date: string;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
  health_workout_uuid: string | null;
  health_average_heart_rate: number | null;
  health_maximum_heart_rate: number | null;
  health_active_kilocalories: number | null;
  health_duration_seconds: number | null;
};

type SessionExerciseRow = {
  id: number;
  session_id: number;
  exercise_id: number;
  replaced_exercise_id: number | null;
  position: number;
  superset_group: string | null;
  tracking_type: TrackingType;
  rest_seconds: number | null;
  exercise_name: string;
  exercise_image_url: string | null;
  replaced_exercise_name: string | null;
};

type SessionSetRow = {
  id: number;
  session_exercise_id: number;
  position: number;
  target_repetitions: number | null;
  target_weight_kilograms: number | null;
  target_duration_seconds: number | null;
  target_distance_meters: number | null;
  repetitions: number | null;
  weight_kilograms: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  completed_at: string | null;
};

function toSessionSet(row: SessionSetRow): SessionSet {
  return {
    id: row.id,
    sessionExerciseId: row.session_exercise_id,
    position: row.position,
    targetRepetitions: row.target_repetitions,
    targetWeightKilograms: row.target_weight_kilograms,
    targetDurationSeconds: row.target_duration_seconds,
    targetDistanceMeters: row.target_distance_meters,
    repetitions: row.repetitions,
    weightKilograms: row.weight_kilograms,
    durationSeconds: row.duration_seconds,
    distanceMeters: row.distance_meters,
    completedAt: row.completed_at,
  };
}

export async function startSession(database: SQLiteDatabase, request: SessionStartRequest): Promise<number> {
  const startedAt = new Date().toISOString();
  let sessionId: number | null = null;

  await database.withTransactionAsync(async () => {
    const openSessionRow = await database.getFirstAsync<ActiveSessionRow>(selectActiveSessionSql);
    if (openSessionRow !== null) {
      const openSession = toActiveSession(openSessionRow);
      if (!isRequestForActiveSession(request, openSession)) {
        throw new ActiveSessionExistsError();
      }
      sessionId = openSession.id;
      return;
    }

    const existingSessions: ExistingPlanEntrySession[] =
      request.planEntryId === null
        ? []
        : (
            await database.getAllAsync<ExistingSessionRow>(
              `SELECT id, finished_at FROM sessions
              WHERE scheduled_date = ? AND plan_entry_id = ?
              ORDER BY started_at, id`,
              request.scheduledDate,
              request.planEntryId,
            )
          ).map((row) => ({ id: row.id, finishedAt: row.finished_at }));

    const sessionStart = resolveSessionStart(request.planEntryId, existingSessions);
    if (sessionStart.kind === 'resume') {
      sessionId = sessionStart.sessionId;
      return;
    }

    const workout = await database.getFirstAsync<WorkoutSnapshotRow>(
      'SELECT name, kind, class_type FROM workouts WHERE id = ?',
      request.workoutId,
    );
    if (workout === null) {
      throw new Error('The workout to start no longer exists');
    }

    const sessionResult = await database.runAsync(
      `INSERT INTO sessions (workout_id, plan_entry_id, workout_name, workout_kind, class_type, scheduled_date, started_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      request.workoutId,
      sessionStart.planEntryId,
      workout.name,
      workout.kind,
      workout.class_type,
      request.scheduledDate,
      startedAt,
    );
    const newSessionId = sessionResult.lastInsertRowId;
    sessionId = newSessionId;

    if (workout.kind !== 'individual') {
      return;
    }

    const itemRows = await database.getAllAsync<{ id: number }>(
      'SELECT id FROM workout_items WHERE workout_id = ? ORDER BY position',
      request.workoutId,
    );
    for (const itemRow of itemRows) {
      const sessionExerciseResult = await database.runAsync(
        `INSERT INTO session_exercises (session_id, exercise_id, position, superset_group, tracking_type, rest_seconds)
        SELECT ?, exercise_id, position, superset_group, tracking_type, rest_seconds
        FROM workout_items WHERE id = ?`,
        newSessionId,
        itemRow.id,
      );
      await database.runAsync(
        `INSERT INTO session_sets
          (session_exercise_id, position, target_repetitions, target_weight_kilograms, target_duration_seconds,
            target_distance_meters)
        SELECT ?, position, repetitions, weight_kilograms, duration_seconds, distance_meters
        FROM target_sets WHERE workout_item_id = ?
        ORDER BY position`,
        sessionExerciseResult.lastInsertRowId,
        itemRow.id,
      );
    }
  });

  if (sessionId === null) {
    throw new Error('The session was not started');
  }
  return sessionId;
}

export async function getSessionWithExercises(
  database: SQLiteDatabase,
  sessionId: number,
): Promise<SessionWithExercises | null> {
  const sessionRow = await database.getFirstAsync<SessionRow>(
    `SELECT id, workout_id, plan_entry_id, workout_name, workout_kind, class_type, scheduled_date, started_at,
      finished_at, notes, health_workout_uuid, health_average_heart_rate, health_maximum_heart_rate,
      health_active_kilocalories, health_duration_seconds
    FROM sessions WHERE id = ?`,
    sessionId,
  );
  if (sessionRow === null) {
    return null;
  }

  const exerciseRows = await database.getAllAsync<SessionExerciseRow>(
    `SELECT session_exercises.id, session_exercises.session_id, session_exercises.exercise_id,
      session_exercises.replaced_exercise_id, session_exercises.position, session_exercises.superset_group,
      session_exercises.tracking_type, session_exercises.rest_seconds,
      exercises.name AS exercise_name, exercises.image_url AS exercise_image_url,
      replaced_exercises.name AS replaced_exercise_name
    FROM session_exercises
    JOIN exercises ON exercises.id = session_exercises.exercise_id
    LEFT JOIN exercises AS replaced_exercises ON replaced_exercises.id = session_exercises.replaced_exercise_id
    WHERE session_exercises.session_id = ?
    ORDER BY session_exercises.position, session_exercises.id`,
    sessionId,
  );

  const setRows = await database.getAllAsync<SessionSetRow>(
    `SELECT session_sets.id, session_sets.session_exercise_id, session_sets.position,
      session_sets.target_repetitions, session_sets.target_weight_kilograms, session_sets.target_duration_seconds,
      session_sets.target_distance_meters, session_sets.repetitions, session_sets.weight_kilograms,
      session_sets.duration_seconds, session_sets.distance_meters, session_sets.completed_at
    FROM session_sets
    JOIN session_exercises ON session_exercises.id = session_sets.session_exercise_id
    WHERE session_exercises.session_id = ?
    ORDER BY session_sets.session_exercise_id, session_sets.position, session_sets.id`,
    sessionId,
  );

  const exercises: SessionExerciseWithSets[] = exerciseRows.map((exerciseRow) => ({
    id: exerciseRow.id,
    sessionId: exerciseRow.session_id,
    exerciseId: exerciseRow.exercise_id,
    replacedExerciseId: exerciseRow.replaced_exercise_id,
    position: exerciseRow.position,
    supersetGroup: exerciseRow.superset_group,
    trackingType: exerciseRow.tracking_type,
    restSeconds: exerciseRow.rest_seconds,
    exercise: {
      id: exerciseRow.exercise_id,
      name: exerciseRow.exercise_name,
      imageUrl: exerciseRow.exercise_image_url,
    },
    replacedExerciseName: exerciseRow.replaced_exercise_name,
    sets: setRows.filter((setRow) => setRow.session_exercise_id === exerciseRow.id).map(toSessionSet),
  }));

  return {
    id: sessionRow.id,
    workoutId: sessionRow.workout_id,
    planEntryId: sessionRow.plan_entry_id,
    workoutName: sessionRow.workout_name,
    workoutKind: sessionRow.workout_kind,
    classType: sessionRow.class_type,
    scheduledDate: sessionRow.scheduled_date,
    startedAt: sessionRow.started_at,
    finishedAt: sessionRow.finished_at,
    notes: sessionRow.notes,
    healthWorkoutUuid: sessionRow.health_workout_uuid,
    healthAverageHeartRate: sessionRow.health_average_heart_rate,
    healthMaximumHeartRate: sessionRow.health_maximum_heart_rate,
    healthActiveKilocalories: sessionRow.health_active_kilocalories,
    healthDurationSeconds: sessionRow.health_duration_seconds,
    exercises,
  };
}

export async function updateSessionSet(
  database: SQLiteDatabase,
  sessionSetId: number,
  values: SetValues,
): Promise<void> {
  await database.runAsync(
    `UPDATE session_sets
    SET repetitions = ?, weight_kilograms = ?, duration_seconds = ?, distance_meters = ?
    WHERE id = ?`,
    values.repetitions,
    values.weightKilograms,
    values.durationSeconds,
    values.distanceMeters,
    sessionSetId,
  );
}

export async function completeSessionSet(
  database: SQLiteDatabase,
  sessionSetId: number,
  completedAt: string,
): Promise<void> {
  await database.runAsync('UPDATE session_sets SET completed_at = ? WHERE id = ?', completedAt, sessionSetId);
}

export async function uncompleteSessionSet(database: SQLiteDatabase, sessionSetId: number): Promise<void> {
  await database.runAsync('UPDATE session_sets SET completed_at = NULL WHERE id = ?', sessionSetId);
}

export async function finishSession(database: SQLiteDatabase, sessionId: number): Promise<void> {
  const finishedAt = new Date().toISOString();
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `DELETE FROM session_sets
      WHERE completed_at IS NULL
        AND session_exercise_id IN (SELECT id FROM session_exercises WHERE session_id = ?)`,
      sessionId,
    );
    await database.runAsync(
      `DELETE FROM session_exercises
      WHERE session_id = ?
        AND NOT EXISTS (SELECT 1 FROM session_sets WHERE session_sets.session_exercise_id = session_exercises.id)`,
      sessionId,
    );
    await database.runAsync(
      'UPDATE sessions SET finished_at = ? WHERE id = ? AND finished_at IS NULL',
      finishedAt,
      sessionId,
    );
  });
}

export async function discardSession(database: SQLiteDatabase, sessionId: number): Promise<void> {
  await database.runAsync('DELETE FROM sessions WHERE id = ?', sessionId);
}

type PreviousSessionExerciseRow = {
  id: number;
};

type PreviousSessionSetRow = {
  position: number;
  repetitions: number | null;
  weight_kilograms: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
};

export async function getPreviousSessionSets(
  database: SQLiteDatabase,
  exerciseId: number,
  beforeSessionId: number,
): Promise<PreviousSessionSet[]> {
  const previousExercise = await database.getFirstAsync<PreviousSessionExerciseRow>(
    `SELECT session_exercises.id
    FROM session_exercises
    JOIN sessions ON sessions.id = session_exercises.session_id
    WHERE session_exercises.exercise_id = ?
      AND sessions.finished_at IS NOT NULL
      AND sessions.id <> ?
      AND sessions.started_at < (SELECT started_at FROM sessions WHERE id = ?)
    ORDER BY sessions.started_at DESC, sessions.id DESC, session_exercises.position
    LIMIT 1`,
    exerciseId,
    beforeSessionId,
    beforeSessionId,
  );
  if (previousExercise === null) {
    return [];
  }
  const setRows = await database.getAllAsync<PreviousSessionSetRow>(
    `SELECT position, repetitions, weight_kilograms, duration_seconds, distance_meters
    FROM session_sets
    WHERE session_exercise_id = ? AND completed_at IS NOT NULL
    ORDER BY position, id`,
    previousExercise.id,
  );
  return setRows.map((setRow) => ({
    position: setRow.position,
    repetitions: setRow.repetitions,
    weightKilograms: setRow.weight_kilograms,
    durationSeconds: setRow.duration_seconds,
    distanceMeters: setRow.distance_meters,
  }));
}

const defaultAddedExerciseRestSeconds = 90;

type NextPositionRow = {
  next_position: number;
};

type SessionExerciseIdentityRow = {
  exercise_id: number;
  replaced_exercise_id: number | null;
};

type TrackingTypeRow = {
  default_tracking_type: TrackingType;
};

type RemainingSessionExerciseRow = {
  id: number;
  superset_group: string | null;
};

type SessionSetIdentifierRow = {
  id: number;
};

type SessionSetActualValuesRow = {
  id: number;
  repetitions: number | null;
  weight_kilograms: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
};

export async function addSessionSet(
  database: SQLiteDatabase,
  sessionExerciseId: number,
  values: SetValues,
): Promise<void> {
  await database.runAsync(
    `INSERT INTO session_sets
      (session_exercise_id, position, repetitions, weight_kilograms, duration_seconds, distance_meters)
    VALUES (?, (SELECT COALESCE(MAX(position), -1) + 1 FROM session_sets WHERE session_exercise_id = ?), ?, ?, ?, ?)`,
    sessionExerciseId,
    sessionExerciseId,
    values.repetitions,
    values.weightKilograms,
    values.durationSeconds,
    values.distanceMeters,
  );
}

export async function removeSessionSet(
  database: SQLiteDatabase,
  sessionExerciseId: number,
  sessionSetId: number,
): Promise<void> {
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      'DELETE FROM session_sets WHERE id = ? AND session_exercise_id = ?',
      sessionSetId,
      sessionExerciseId,
    );
    const remainingSets = await database.getAllAsync<SessionSetIdentifierRow>(
      'SELECT id FROM session_sets WHERE session_exercise_id = ? ORDER BY position, id',
      sessionExerciseId,
    );
    for (const [index, remainingSet] of remainingSets.entries()) {
      await database.runAsync(
        'UPDATE session_sets SET position = ? WHERE id = ? AND session_exercise_id = ?',
        index,
        remainingSet.id,
        sessionExerciseId,
      );
    }
  });
}

export async function addSessionExercises(
  database: SQLiteDatabase,
  sessionId: number,
  exerciseIds: number[],
): Promise<void> {
  await database.withTransactionAsync(async () => {
    for (const exerciseId of exerciseIds) {
      const nextPosition = await database.getFirstAsync<NextPositionRow>(
        'SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM session_exercises WHERE session_id = ?',
        sessionId,
      );
      const insertResult = await database.runAsync(
        `INSERT INTO session_exercises (session_id, exercise_id, position, tracking_type, rest_seconds)
        SELECT ?, id, ?, default_tracking_type, ? FROM exercises WHERE id = ?`,
        sessionId,
        nextPosition?.next_position ?? 0,
        defaultAddedExerciseRestSeconds,
        exerciseId,
      );
      if (insertResult.changes === 0) {
        continue;
      }
      await database.runAsync(
        'INSERT INTO session_sets (session_exercise_id, position) VALUES (?, 0)',
        insertResult.lastInsertRowId,
      );
    }
  });
}

export async function replaceSessionExercise(
  database: SQLiteDatabase,
  sessionId: number,
  sessionExerciseId: number,
  newExerciseId: number,
): Promise<void> {
  await database.withTransactionAsync(async () => {
    const currentExercise = await database.getFirstAsync<SessionExerciseIdentityRow>(
      'SELECT exercise_id, replaced_exercise_id FROM session_exercises WHERE id = ? AND session_id = ?',
      sessionExerciseId,
      sessionId,
    );
    const newExercise = await database.getFirstAsync<TrackingTypeRow>(
      'SELECT default_tracking_type FROM exercises WHERE id = ?',
      newExerciseId,
    );
    if (currentExercise === null || newExercise === null) {
      throw new Error('The exercise to replace no longer exists');
    }

    await database.runAsync(
      `UPDATE session_exercises
      SET exercise_id = ?, replaced_exercise_id = ?, tracking_type = ?
      WHERE id = ? AND session_id = ?`,
      newExerciseId,
      resolveReplacedExerciseId({
        currentExerciseId: currentExercise.exercise_id,
        currentReplacedExerciseId: currentExercise.replaced_exercise_id,
        newExerciseId,
      }),
      newExercise.default_tracking_type,
      sessionExerciseId,
      sessionId,
    );

    const setRows = await database.getAllAsync<SessionSetActualValuesRow>(
      `SELECT id, repetitions, weight_kilograms, duration_seconds, distance_meters
      FROM session_sets WHERE session_exercise_id = ?`,
      sessionExerciseId,
    );
    for (const setRow of setRows) {
      const keptValues = actualValuesAfterReplace(
        {
          repetitions: setRow.repetitions,
          weightKilograms: setRow.weight_kilograms,
          durationSeconds: setRow.duration_seconds,
          distanceMeters: setRow.distance_meters,
        },
        newExercise.default_tracking_type,
      );
      await updateSessionSet(database, setRow.id, keptValues);
    }
  });
}

export async function removeSessionExercise(
  database: SQLiteDatabase,
  sessionId: number,
  sessionExerciseId: number,
): Promise<void> {
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      'DELETE FROM session_exercises WHERE id = ? AND session_id = ?',
      sessionExerciseId,
      sessionId,
    );
    const remainingExercises = await database.getAllAsync<RemainingSessionExerciseRow>(
      'SELECT id, superset_group FROM session_exercises WHERE session_id = ? ORDER BY position, id',
      sessionId,
    );
    const normalisedExercises = normaliseSessionExercises(
      remainingExercises.map((row) => ({ id: row.id, supersetGroup: row.superset_group })),
    );
    for (const normalisedExercise of normalisedExercises) {
      await database.runAsync(
        'UPDATE session_exercises SET position = ?, superset_group = ? WHERE id = ? AND session_id = ?',
        normalisedExercise.position,
        normalisedExercise.supersetGroup,
        normalisedExercise.id,
        sessionId,
      );
    }
  });
}

export async function updateSessionExerciseRest(
  database: SQLiteDatabase,
  sessionId: number,
  sessionExerciseId: number,
  restSeconds: number | null,
): Promise<void> {
  await database.runAsync(
    'UPDATE session_exercises SET rest_seconds = ? WHERE id = ? AND session_id = ?',
    restSeconds,
    sessionExerciseId,
    sessionId,
  );
}

export async function updateSessionNotes(
  database: SQLiteDatabase,
  sessionId: number,
  notes: string | null,
): Promise<void> {
  await database.runAsync('UPDATE sessions SET notes = ? WHERE id = ?', notes, sessionId);
}

type CompletedSetRow = {
  exercise_id: number;
  tracking_type: TrackingType;
  repetitions: number | null;
  weight_kilograms: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
};

export async function listCompletedSetsForExercises(
  database: SQLiteDatabase,
  exerciseIds: readonly number[],
  beforeStartedAt: string,
): Promise<CompletedSet[]> {
  if (exerciseIds.length === 0) {
    return [];
  }
  const placeholders = exerciseIds.map(() => '?').join(', ');
  const rows = await database.getAllAsync<CompletedSetRow>(
    `SELECT session_exercises.exercise_id, session_exercises.tracking_type, session_sets.repetitions,
      session_sets.weight_kilograms, session_sets.duration_seconds, session_sets.distance_meters
    FROM session_sets
    JOIN session_exercises ON session_exercises.id = session_sets.session_exercise_id
    JOIN sessions ON sessions.id = session_exercises.session_id
    WHERE session_exercises.exercise_id IN (${placeholders})
      AND session_sets.completed_at IS NOT NULL
      AND sessions.finished_at IS NOT NULL
      AND sessions.started_at < ?`,
    ...exerciseIds,
    beforeStartedAt,
  );
  return rows.map((row) => ({
    exerciseId: row.exercise_id,
    trackingType: row.tracking_type,
    repetitions: row.repetitions,
    weightKilograms: row.weight_kilograms,
    durationSeconds: row.duration_seconds,
    distanceMeters: row.distance_meters,
  }));
}
