import type { SQLiteDatabase } from 'expo-sqlite';

import { getSetting, setSetting } from '@/database/repositories/appSettingsRepository';
import { defaultExerciseLibraryVersion, defaultExercises } from '@/exercises/defaultExercises';

const libraryVersionSettingKey = 'default_exercise_library_version';

export async function seedDefaultExercises(database: SQLiteDatabase) {
  const seededVersion = await getSetting(database, libraryVersionSettingKey);
  if (seededVersion === defaultExerciseLibraryVersion) {
    return;
  }

  const seededAt = new Date().toISOString();
  await database.withTransactionAsync(async () => {
    for (const exercise of defaultExercises) {
      await database.runAsync(
        `INSERT INTO exercises (name, body_part, image_url, video_url, default_tracking_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(name) DO UPDATE SET
          name = excluded.name,
          body_part = excluded.body_part,
          image_url = excluded.image_url,
          video_url = excluded.video_url,
          default_tracking_type = excluded.default_tracking_type`,
        exercise.name,
        exercise.bodyPart,
        exercise.imageUrl,
        exercise.videoUrl,
        exercise.defaultTrackingType,
        seededAt,
      );
    }
    await setSetting(database, libraryVersionSettingKey, defaultExerciseLibraryVersion);
  });
}
