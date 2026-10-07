import type { SQLiteDatabase } from 'expo-sqlite';

import { addExerciseNotes } from '@/database/migrations/addExerciseNotes';
import { addNotificationIdentifier } from '@/database/migrations/addNotificationIdentifier';
import { addSessionExerciseRestSeconds } from '@/database/migrations/addSessionExerciseRestSeconds';
import { createInitialSchema } from '@/database/migrations/createInitialSchema';
import { createTrainingSchema } from '@/database/migrations/createTrainingSchema';

type Migration = (database: SQLiteDatabase) => Promise<void>;

export const migrations: Migration[] = [
  createInitialSchema,
  createTrainingSchema,
  addSessionExerciseRestSeconds,
  addNotificationIdentifier,
  addExerciseNotes,
];
