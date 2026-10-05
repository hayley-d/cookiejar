import type { SQLiteDatabase } from 'expo-sqlite';

import type { ClassType } from '@/types/ClassType';
import type { WorkoutKind } from '@/types/WorkoutKind';
import type { WorkoutSummary } from '@/types/WorkoutSummary';
import type { WorkoutEditorState } from '@/workouts/workoutEditorReducer';
import { toWorkoutSaveRows } from '@/workouts/workoutSaveRows';

type WorkoutSummaryRow = {
  id: number;
  name: string;
  kind: WorkoutKind;
  class_type: ClassType | null;
  duration_minutes: number | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  exercise_count: number;
};

function toWorkoutSummary(row: WorkoutSummaryRow): WorkoutSummary {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    classType: row.class_type,
    durationMinutes: row.duration_minutes,
    description: row.description,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    exerciseCount: row.exercise_count,
  };
}

export async function listWorkouts(database: SQLiteDatabase): Promise<WorkoutSummary[]> {
  const rows = await database.getAllAsync<WorkoutSummaryRow>(
    `SELECT workouts.id, workouts.name, workouts.kind, workouts.class_type, workouts.duration_minutes,
      workouts.description, workouts.image_url, workouts.created_at, workouts.updated_at,
      COUNT(workout_items.id) AS exercise_count
    FROM workouts
    LEFT JOIN workout_items ON workout_items.workout_id = workouts.id
    GROUP BY workouts.id
    ORDER BY workouts.updated_at DESC, workouts.id DESC`,
  );
  return rows.map(toWorkoutSummary);
}

export async function saveWorkout(database: SQLiteDatabase, editorState: WorkoutEditorState): Promise<number> {
  const { workoutId, workout, items } = toWorkoutSaveRows(editorState);
  const now = new Date().toISOString();
  let savedWorkoutId = workoutId;

  await database.withTransactionAsync(async () => {
    if (savedWorkoutId === null) {
      const result = await database.runAsync(
        `INSERT INTO workouts (name, kind, class_type, duration_minutes, description, image_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        workout.name,
        workout.kind,
        workout.classType,
        workout.durationMinutes,
        workout.description,
        workout.imageUrl,
        now,
        now,
      );
      savedWorkoutId = result.lastInsertRowId;
    } else {
      await database.runAsync(
        `UPDATE workouts
        SET name = ?, kind = ?, class_type = ?, duration_minutes = ?, description = ?, image_url = ?, updated_at = ?
        WHERE id = ?`,
        workout.name,
        workout.kind,
        workout.classType,
        workout.durationMinutes,
        workout.description,
        workout.imageUrl,
        now,
        savedWorkoutId,
      );
      await database.runAsync('DELETE FROM workout_items WHERE workout_id = ?', savedWorkoutId);
    }

    for (const item of items) {
      const itemResult = await database.runAsync(
        `INSERT INTO workout_items (workout_id, exercise_id, position, superset_group, tracking_type, rest_seconds)
        VALUES (?, ?, ?, ?, ?, ?)`,
        savedWorkoutId,
        item.exerciseId,
        item.position,
        item.supersetGroup,
        item.trackingType,
        item.restSeconds,
      );
      for (const targetSet of item.targetSets) {
        await database.runAsync(
          `INSERT INTO target_sets
            (workout_item_id, position, repetitions, weight_kilograms, duration_seconds, distance_meters)
          VALUES (?, ?, ?, ?, ?, ?)`,
          itemResult.lastInsertRowId,
          targetSet.position,
          targetSet.repetitions,
          targetSet.weightKilograms,
          targetSet.durationSeconds,
          targetSet.distanceMeters,
        );
      }
    }
  });

  if (savedWorkoutId === null) {
    throw new Error('The workout was not saved');
  }
  return savedWorkoutId;
}
