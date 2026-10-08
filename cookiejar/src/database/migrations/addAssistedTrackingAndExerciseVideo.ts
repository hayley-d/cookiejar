import type { SQLiteDatabase } from 'expo-sqlite';

export async function addAssistedTrackingAndExerciseVideo(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE exercises_rebuilt (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      body_part TEXT NOT NULL CHECK (body_part IN ('chest','back','shoulders','biceps','triceps','forearms','core','glutes','quadriceps','hamstrings','calves','full_body','cardio','mobility')),
      image_url TEXT,
      video_url TEXT,
      default_tracking_type TEXT NOT NULL CHECK (default_tracking_type IN ('repetitions','repetitions_and_weight','repetitions_and_assistance','duration','distance')),
      created_at TEXT NOT NULL,
      notes TEXT
    );

    INSERT INTO exercises_rebuilt (id, name, body_part, image_url, default_tracking_type, created_at, notes)
    SELECT id, name, body_part, image_url, default_tracking_type, created_at, notes FROM exercises;

    DROP TABLE exercises;
    ALTER TABLE exercises_rebuilt RENAME TO exercises;

    CREATE TABLE workout_items_rebuilt (
      id INTEGER PRIMARY KEY NOT NULL,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      position INTEGER NOT NULL,
      superset_group TEXT,
      tracking_type TEXT NOT NULL CHECK (tracking_type IN ('repetitions','repetitions_and_weight','repetitions_and_assistance','duration','distance')),
      rest_seconds INTEGER,
      notes TEXT
    );

    INSERT INTO workout_items_rebuilt (id, workout_id, exercise_id, position, superset_group, tracking_type, rest_seconds, notes)
    SELECT id, workout_id, exercise_id, position, superset_group, tracking_type, rest_seconds, notes FROM workout_items;

    DROP TABLE workout_items;
    ALTER TABLE workout_items_rebuilt RENAME TO workout_items;

    CREATE INDEX workout_items_by_workout ON workout_items(workout_id, position);
    CREATE INDEX workout_items_by_exercise ON workout_items(exercise_id);
  `);
}
