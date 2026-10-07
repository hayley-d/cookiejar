import type { SQLiteDatabase } from 'expo-sqlite';

import type { BodyPart } from '@/types/BodyPart';
import type { Exercise } from '@/types/Exercise';
import type { TrackingType } from '@/types/TrackingType';

type ExerciseRow = {
  id: number;
  name: string;
  body_part: BodyPart;
  image_url: string | null;
  notes: string | null;
  default_tracking_type: TrackingType;
  created_at: string;
};

type UsageCountRow = {
  usage_count: number;
};

export type NewExercise = Omit<Exercise, 'id' | 'createdAt'>;

export type ExerciseChanges = NewExercise;

export class DuplicateExerciseNameError extends Error {
  constructor(readonly exerciseName: string) {
    super(`An exercise called "${exerciseName}" already exists`);
    this.name = 'DuplicateExerciseNameError';
  }
}

const exerciseColumns = 'id, name, body_part, image_url, notes, default_tracking_type, created_at';

function toExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    bodyPart: row.body_part,
    imageUrl: row.image_url,
    notes: row.notes,
    defaultTrackingType: row.default_tracking_type,
    createdAt: row.created_at,
  };
}

function isUniqueNameViolation(error: unknown) {
  return error instanceof Error && error.message.includes('UNIQUE constraint failed: exercises.name');
}

export async function listExercises(database: SQLiteDatabase): Promise<Exercise[]> {
  const rows = await database.getAllAsync<ExerciseRow>(
    `SELECT ${exerciseColumns} FROM exercises ORDER BY name COLLATE NOCASE`,
  );
  return rows.map(toExercise);
}

export async function listRecentlyUsedExercises(database: SQLiteDatabase, limit?: number): Promise<Exercise[]> {
  const rows = await database.getAllAsync<ExerciseRow>(
    `SELECT exercises.id, exercises.name, exercises.body_part, exercises.image_url,
      exercises.notes, exercises.default_tracking_type, exercises.created_at
    FROM exercises
    LEFT JOIN session_exercises ON session_exercises.exercise_id = exercises.id
    LEFT JOIN sessions ON sessions.id = session_exercises.session_id
    GROUP BY exercises.id
    ORDER BY MAX(sessions.started_at) IS NULL, MAX(sessions.started_at) DESC, exercises.created_at DESC, exercises.id DESC
    LIMIT ?`,
    limit ?? -1,
  );
  return rows.map(toExercise);
}

export async function getExercise(database: SQLiteDatabase, exerciseId: number): Promise<Exercise | null> {
  const row = await database.getFirstAsync<ExerciseRow>(
    `SELECT ${exerciseColumns} FROM exercises WHERE id = ?`,
    exerciseId,
  );
  return row ? toExercise(row) : null;
}

export async function createExercise(database: SQLiteDatabase, newExercise: NewExercise): Promise<number> {
  try {
    const result = await database.runAsync(
      'INSERT INTO exercises (name, body_part, image_url, notes, default_tracking_type, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      newExercise.name,
      newExercise.bodyPart,
      newExercise.imageUrl,
      newExercise.notes,
      newExercise.defaultTrackingType,
      new Date().toISOString(),
    );
    return result.lastInsertRowId;
  } catch (error) {
    if (isUniqueNameViolation(error)) {
      throw new DuplicateExerciseNameError(newExercise.name);
    }
    throw error;
  }
}

export async function updateExercise(
  database: SQLiteDatabase,
  exerciseId: number,
  changes: ExerciseChanges,
): Promise<void> {
  try {
    await database.runAsync(
      'UPDATE exercises SET name = ?, body_part = ?, image_url = ?, notes = ?, default_tracking_type = ? WHERE id = ?',
      changes.name,
      changes.bodyPart,
      changes.imageUrl,
      changes.notes,
      changes.defaultTrackingType,
      exerciseId,
    );
  } catch (error) {
    if (isUniqueNameViolation(error)) {
      throw new DuplicateExerciseNameError(changes.name);
    }
    throw error;
  }
}

export async function countExerciseUsages(database: SQLiteDatabase, exerciseId: number): Promise<number> {
  const row = await database.getFirstAsync<UsageCountRow>(
    `SELECT
      (SELECT COUNT(*) FROM workout_items WHERE exercise_id = $exerciseId)
      + (SELECT COUNT(*) FROM session_exercises WHERE exercise_id = $exerciseId OR replaced_exercise_id = $exerciseId)
      AS usage_count`,
    { $exerciseId: exerciseId },
  );
  return row?.usage_count ?? 0;
}

export async function deleteExercise(database: SQLiteDatabase, exerciseId: number): Promise<void> {
  await database.runAsync('DELETE FROM exercises WHERE id = ?', exerciseId);
}
