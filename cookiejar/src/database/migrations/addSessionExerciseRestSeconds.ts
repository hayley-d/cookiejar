import type { SQLiteDatabase } from 'expo-sqlite';

export async function addSessionExerciseRestSeconds(database: SQLiteDatabase) {
  await database.execAsync('ALTER TABLE session_exercises ADD COLUMN rest_seconds INTEGER;');
}
