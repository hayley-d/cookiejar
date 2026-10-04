import type { SQLiteDatabase } from 'expo-sqlite';

import type { BodyPart } from '@/types/BodyPart';
import type { Exercise } from '@/types/Exercise';
import type { TrackingType } from '@/types/TrackingType';

type ExerciseRow = {
  id: number;
  name: string;
  body_part: BodyPart;
  image_url: string | null;
  default_tracking_type: TrackingType;
  created_at: string;
};

export type NewExercise = Omit<Exercise, 'id' | 'createdAt'>;

export class DuplicateExerciseNameError extends Error {
  constructor(readonly exerciseName: string) {
    super(`An exercise called "${exerciseName}" already exists`);
    this.name = 'DuplicateExerciseNameError';
  }
}

const exerciseColumns = 'id, name, body_part, image_url, default_tracking_type, created_at';

function toExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    bodyPart: row.body_part,
    imageUrl: row.image_url,
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
      'INSERT INTO exercises (name, body_part, image_url, default_tracking_type, created_at) VALUES (?, ?, ?, ?, ?)',
      newExercise.name,
      newExercise.bodyPart,
      newExercise.imageUrl,
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
