import type { SQLiteDatabase } from 'expo-sqlite';

import { migrateDatabase } from '@/database/migrateDatabase';
import { seedDefaultExercises } from '@/database/seedDefaultExercises';
import { seedDefaultSwimWorkouts } from '@/database/seedDefaultSwimWorkouts';

export async function prepareDatabase(database: SQLiteDatabase) {
  await migrateDatabase(database);
  await seedDefaultExercises(database);
  await seedDefaultSwimWorkouts(database);
}
