import type { SQLiteDatabase } from 'expo-sqlite';

import { addActivities } from '@/database/migrations/addActivities';
import { addAssistedTrackingAndExerciseVideo } from '@/database/migrations/addAssistedTrackingAndExerciseVideo';
import { addExerciseNotes } from '@/database/migrations/addExerciseNotes';
import { addNotificationIdentifier } from '@/database/migrations/addNotificationIdentifier';
import { addSessionExerciseRestSeconds } from '@/database/migrations/addSessionExerciseRestSeconds';
import { addSwimming } from '@/database/migrations/addSwimming';
import { addWorkoutBuiltInKey } from '@/database/migrations/addWorkoutBuiltInKey';
import { createInitialSchema } from '@/database/migrations/createInitialSchema';
import { createTrainingSchema } from '@/database/migrations/createTrainingSchema';

type Migration = (database: SQLiteDatabase) => Promise<void>;

export const migrations: Migration[] = [
  createInitialSchema,
  createTrainingSchema,
  addSessionExerciseRestSeconds,
  addNotificationIdentifier,
  addExerciseNotes,
  addAssistedTrackingAndExerciseVideo,
  addActivities,
  addSwimming,
  addWorkoutBuiltInKey,
];
