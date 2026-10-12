import type { SQLiteDatabase } from 'expo-sqlite';

export async function addWorkoutBuiltInKey(database: SQLiteDatabase) {
  await database.execAsync(`
    ALTER TABLE workouts ADD COLUMN built_in_key TEXT;
    CREATE UNIQUE INDEX workouts_by_built_in_key ON workouts(built_in_key);
  `);
}
