import type { SQLiteDatabase } from 'expo-sqlite';

import type { BodyPart } from '@/types/BodyPart';
import type { ClassType } from '@/types/ClassType';
import type { TrackingType } from '@/types/TrackingType';
import type { WorkoutKind } from '@/types/WorkoutKind';
import type { WorkoutSummary } from '@/types/WorkoutSummary';
import type { WorkoutItemWithTargetSets, WorkoutWithItems } from '@/types/WorkoutWithItems';
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

type WorkoutRow = Omit<WorkoutSummaryRow, 'exercise_count'>;

type WorkoutItemRow = {
  id: number;
  workout_id: number;
  exercise_id: number;
  position: number;
  superset_group: string | null;
  tracking_type: TrackingType;
  rest_seconds: number | null;
  notes: string | null;
  exercise_name: string;
  exercise_image_url: string | null;
  exercise_body_part: BodyPart;
  exercise_default_tracking_type: TrackingType;
};

type TargetSetRow = {
  id: number;
  workout_item_id: number;
  position: number;
  repetitions: number | null;
  weight_kilograms: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
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

export async function getWorkoutWithItems(
  database: SQLiteDatabase,
  workoutId: number,
): Promise<WorkoutWithItems | null> {
  const workoutRow = await database.getFirstAsync<WorkoutRow>(
    `SELECT id, name, kind, class_type, duration_minutes, description, image_url, created_at, updated_at
    FROM workouts WHERE id = ?`,
    workoutId,
  );
  if (workoutRow === null) {
    return null;
  }

  const itemRows = await database.getAllAsync<WorkoutItemRow>(
    `SELECT workout_items.id, workout_items.workout_id, workout_items.exercise_id, workout_items.position,
      workout_items.superset_group, workout_items.tracking_type, workout_items.rest_seconds, workout_items.notes,
      exercises.name AS exercise_name, exercises.image_url AS exercise_image_url, exercises.body_part AS exercise_body_part,
      exercises.default_tracking_type AS exercise_default_tracking_type
    FROM workout_items
    JOIN exercises ON exercises.id = workout_items.exercise_id
    WHERE workout_items.workout_id = ?
    ORDER BY workout_items.position`,
    workoutId,
  );

  const targetSetRows = await database.getAllAsync<TargetSetRow>(
    `SELECT target_sets.id, target_sets.workout_item_id, target_sets.position, target_sets.repetitions,
      target_sets.weight_kilograms, target_sets.duration_seconds, target_sets.distance_meters
    FROM target_sets
    JOIN workout_items ON workout_items.id = target_sets.workout_item_id
    WHERE workout_items.workout_id = ?
    ORDER BY target_sets.workout_item_id, target_sets.position`,
    workoutId,
  );

  const items: WorkoutItemWithTargetSets[] = itemRows.map((itemRow) => ({
    id: itemRow.id,
    workoutId: itemRow.workout_id,
    exerciseId: itemRow.exercise_id,
    position: itemRow.position,
    supersetGroup: itemRow.superset_group,
    trackingType: itemRow.tracking_type,
    restSeconds: itemRow.rest_seconds,
    notes: itemRow.notes,
    exercise: {
      id: itemRow.exercise_id,
      name: itemRow.exercise_name,
      imageUrl: itemRow.exercise_image_url,
      bodyPart: itemRow.exercise_body_part,
      defaultTrackingType: itemRow.exercise_default_tracking_type,
    },
    targetSets: targetSetRows
      .filter((targetSetRow) => targetSetRow.workout_item_id === itemRow.id)
      .map((targetSetRow) => ({
        id: targetSetRow.id,
        workoutItemId: targetSetRow.workout_item_id,
        position: targetSetRow.position,
        repetitions: targetSetRow.repetitions,
        weightKilograms: targetSetRow.weight_kilograms,
        durationSeconds: targetSetRow.duration_seconds,
        distanceMeters: targetSetRow.distance_meters,
      })),
  }));

  return {
    id: workoutRow.id,
    name: workoutRow.name,
    kind: workoutRow.kind,
    classType: workoutRow.class_type,
    durationMinutes: workoutRow.duration_minutes,
    description: workoutRow.description,
    imageUrl: workoutRow.image_url,
    createdAt: workoutRow.created_at,
    updatedAt: workoutRow.updated_at,
    items,
  };
}

export async function duplicateWorkout(database: SQLiteDatabase, workoutId: number): Promise<number> {
  const now = new Date().toISOString();
  let duplicatedWorkoutId: number | null = null;

  await database.withTransactionAsync(async () => {
    const workoutResult = await database.runAsync(
      `INSERT INTO workouts (name, kind, class_type, duration_minutes, description, image_url, created_at, updated_at)
      SELECT name || ' (copy)', kind, class_type, duration_minutes, description, image_url, ?, ?
      FROM workouts WHERE id = ?`,
      now,
      now,
      workoutId,
    );
    if (workoutResult.changes === 0) {
      throw new Error('The workout to duplicate no longer exists');
    }
    const newWorkoutId = workoutResult.lastInsertRowId;
    duplicatedWorkoutId = newWorkoutId;

    const itemRows = await database.getAllAsync<{ id: number }>(
      'SELECT id FROM workout_items WHERE workout_id = ? ORDER BY position',
      workoutId,
    );
    for (const itemRow of itemRows) {
      const itemResult = await database.runAsync(
        `INSERT INTO workout_items (workout_id, exercise_id, position, superset_group, tracking_type, rest_seconds, notes)
        SELECT ?, exercise_id, position, superset_group, tracking_type, rest_seconds, notes
        FROM workout_items WHERE id = ?`,
        newWorkoutId,
        itemRow.id,
      );
      await database.runAsync(
        `INSERT INTO target_sets
          (workout_item_id, position, repetitions, weight_kilograms, duration_seconds, distance_meters)
        SELECT ?, position, repetitions, weight_kilograms, duration_seconds, distance_meters
        FROM target_sets WHERE workout_item_id = ?`,
        itemResult.lastInsertRowId,
        itemRow.id,
      );
    }
  });

  if (duplicatedWorkoutId === null) {
    throw new Error('The workout was not duplicated');
  }
  return duplicatedWorkoutId;
}

export async function deleteWorkout(database: SQLiteDatabase, workoutId: number): Promise<void> {
  await database.runAsync('DELETE FROM workouts WHERE id = ?', workoutId);
}

export async function countPlansUsingWorkout(database: SQLiteDatabase, workoutId: number): Promise<number> {
  const row = await database.getFirstAsync<{ plan_count: number }>(
    'SELECT COUNT(DISTINCT plan_id) AS plan_count FROM plan_entries WHERE workout_id = ?',
    workoutId,
  );
  return row?.plan_count ?? 0;
}
