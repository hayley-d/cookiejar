import type { SQLiteDatabase } from 'expo-sqlite';

export async function createInitialSchema(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE exercises (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      measurement_type TEXT NOT NULL CHECK (measurement_type IN ('repetitions_and_weight', 'duration', 'distance')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE workouts (
      id INTEGER PRIMARY KEY NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      notes TEXT
    );

    CREATE TABLE workout_exercises (
      id INTEGER PRIMARY KEY NOT NULL,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      position INTEGER NOT NULL
    );

    CREATE TABLE sets (
      id INTEGER PRIMARY KEY NOT NULL,
      workout_exercise_id INTEGER NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      repetitions INTEGER,
      weight_kilograms REAL,
      duration_seconds INTEGER,
      distance_meters REAL,
      completed_at TEXT
    );

    CREATE INDEX workout_exercises_by_workout ON workout_exercises(workout_id);
    CREATE INDEX workout_exercises_by_exercise ON workout_exercises(exercise_id);
    CREATE INDEX sets_by_workout_exercise ON sets(workout_exercise_id);
  `);
}
