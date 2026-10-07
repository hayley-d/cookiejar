import type { SQLiteDatabase } from 'expo-sqlite';

export async function addExerciseNotes(database: SQLiteDatabase) {
  await database.execAsync('ALTER TABLE exercises ADD COLUMN notes TEXT;');
}
