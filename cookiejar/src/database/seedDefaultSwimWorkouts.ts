import type { SQLiteDatabase } from 'expo-sqlite';

import { getSetting, setSetting } from '@/database/repositories/appSettingsRepository';
import { insertSwimSections } from '@/database/repositories/workoutRepository';
import { defaultSwimWorkoutLibraryVersion, defaultSwimWorkouts } from '@/swimming/defaultSwimWorkouts';
import type { DefaultSwimWorkout } from '@/swimming/defaultSwimWorkouts';
import { dismissedBuiltInKeysSettingKey, parseDismissedBuiltInKeys } from '@/swimming/dismissedBuiltInKeys';
import { planSwimWorkoutSeeding } from '@/swimming/planSwimWorkoutSeeding';
import type { StoredBuiltInSwimWorkout } from '@/swimming/planSwimWorkoutSeeding';
import type { SwimSection } from '@/swimming/swimTypes';

const libraryVersionSettingKey = 'default_swim_workout_library_version';

type StoredBuiltInRow = {
  id: number;
  built_in_key: string;
};

type ExerciseIdRow = {
  id: number;
  name: string;
};

function resolveSections(workout: DefaultSwimWorkout, exerciseIdByName: Map<string, number>): SwimSection[] {
  return workout.sections.map((section) => ({
    name: section.name,
    blocks: section.blocks.map((block) => ({
      rounds: block.rounds,
      restAfterSeconds: block.restAfterSeconds,
      sets: block.sets.map((set) => {
        const { strokeName, ...setFields } = set;
        const exerciseId = exerciseIdByName.get(strokeName);
        if (exerciseId === undefined) {
          throw new Error(`Default swim exercise "${strokeName}" is not seeded`);
        }
        return { ...setFields, exerciseId, exerciseName: strokeName };
      }),
    })),
  }));
}

export async function seedDefaultSwimWorkouts(database: SQLiteDatabase) {
  const storedVersion = await getSetting(database, libraryVersionSettingKey);
  if (storedVersion === defaultSwimWorkoutLibraryVersion) {
    return;
  }

  const storedRows = await database.getAllAsync<StoredBuiltInRow>(
    'SELECT id, built_in_key FROM workouts WHERE built_in_key IS NOT NULL',
  );
  const storedBuiltInWorkouts: StoredBuiltInSwimWorkout[] = storedRows.map((row) => ({
    workoutId: row.id,
    builtInKey: row.built_in_key,
  }));
  const dismissedKeys = parseDismissedBuiltInKeys(await getSetting(database, dismissedBuiltInKeysSettingKey));
  const plan = planSwimWorkoutSeeding({
    storedBuiltInWorkouts,
    storedVersion,
    contentVersion: defaultSwimWorkoutLibraryVersion,
    dismissedKeys,
    content: defaultSwimWorkouts,
  });

  const exerciseRows = await database.getAllAsync<ExerciseIdRow>('SELECT id, name FROM exercises');
  const exerciseIdByName = new Map(exerciseRows.map((row) => [row.name, row.id] as const));
  const seededAt = new Date().toISOString();

  await database.withTransactionAsync(async () => {
    for (const workout of plan.inserts) {
      const result = await database.runAsync(
        `INSERT INTO workouts (name, kind, pool_length_meters, built_in_key, created_at, updated_at)
        VALUES (?, 'swim', ?, ?, ?, ?)`,
        workout.name,
        workout.poolLengthMeters,
        workout.builtInKey,
        seededAt,
        seededAt,
      );
      await insertSwimSections(database, result.lastInsertRowId, resolveSections(workout, exerciseIdByName));
    }
    for (const update of plan.updates) {
      await database.runAsync(
        'UPDATE workouts SET name = ?, pool_length_meters = ?, updated_at = ? WHERE id = ?',
        update.workout.name,
        update.workout.poolLengthMeters,
        seededAt,
        update.workoutId,
      );
      await database.runAsync('DELETE FROM swim_sections WHERE workout_id = ?', update.workoutId);
      await insertSwimSections(database, update.workoutId, resolveSections(update.workout, exerciseIdByName));
    }
    await setSetting(database, libraryVersionSettingKey, defaultSwimWorkoutLibraryVersion);
  });
}
