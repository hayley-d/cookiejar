import type { SQLiteDatabase } from 'expo-sqlite';

export async function addActivities(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE workouts_rebuilt (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('individual','class','activity')),
      class_type TEXT CHECK (class_type IN ('yoga','pilates','spin','barre','other')),
      activity_type TEXT CHECK (activity_type IN ('hike','run','walk')),
      duration_minutes INTEGER,
      description TEXT,
      image_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK ((kind = 'class') = (class_type IS NOT NULL)),
      CHECK ((kind = 'activity') = (activity_type IS NOT NULL))
    );

    INSERT INTO workouts_rebuilt
      (id, name, kind, class_type, activity_type, duration_minutes, description, image_url, created_at, updated_at)
    SELECT
      id,
      name,
      CASE WHEN class_type = 'hiking' THEN 'activity' ELSE kind END,
      CASE WHEN class_type = 'hiking' THEN NULL ELSE class_type END,
      CASE WHEN class_type = 'hiking' THEN 'hike' ELSE NULL END,
      CASE WHEN class_type = 'hiking' THEN NULL ELSE duration_minutes END,
      description,
      image_url,
      created_at,
      updated_at
    FROM workouts;

    DROP TABLE workouts;
    ALTER TABLE workouts_rebuilt RENAME TO workouts;

    CREATE TABLE sessions_rebuilt (
      id INTEGER PRIMARY KEY NOT NULL,
      workout_id INTEGER REFERENCES workouts(id) ON DELETE SET NULL,
      plan_entry_id INTEGER REFERENCES plan_entries(id) ON DELETE SET NULL,
      workout_name TEXT NOT NULL,
      workout_kind TEXT NOT NULL CHECK (workout_kind IN ('individual','class','activity')),
      class_type TEXT,
      activity_type TEXT CHECK (activity_type IN ('hike','run','walk')),
      scheduled_date TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      notes TEXT,
      health_workout_uuid TEXT,
      health_average_heart_rate REAL,
      health_maximum_heart_rate REAL,
      health_active_kilocalories REAL,
      health_duration_seconds INTEGER,
      distance_meters REAL,
      elevation_gain_meters REAL,
      active_kilocalories REAL,
      average_heart_rate REAL
    );

    INSERT INTO sessions_rebuilt
      (id, workout_id, plan_entry_id, workout_name, workout_kind, class_type, activity_type, scheduled_date, started_at,
        finished_at, notes, health_workout_uuid, health_average_heart_rate, health_maximum_heart_rate,
        health_active_kilocalories, health_duration_seconds, active_kilocalories, average_heart_rate)
    SELECT
      id,
      workout_id,
      plan_entry_id,
      workout_name,
      CASE WHEN class_type = 'hiking' THEN 'activity' ELSE workout_kind END,
      CASE WHEN class_type = 'hiking' THEN NULL ELSE class_type END,
      CASE WHEN class_type = 'hiking' THEN 'hike' ELSE NULL END,
      scheduled_date,
      started_at,
      finished_at,
      notes,
      health_workout_uuid,
      health_average_heart_rate,
      health_maximum_heart_rate,
      health_active_kilocalories,
      health_duration_seconds,
      CASE WHEN class_type = 'hiking' THEN health_active_kilocalories ELSE NULL END,
      CASE WHEN class_type = 'hiking' THEN health_average_heart_rate ELSE NULL END
    FROM sessions;

    DROP TABLE sessions;
    ALTER TABLE sessions_rebuilt RENAME TO sessions;

    CREATE INDEX sessions_by_scheduled_date ON sessions(scheduled_date);
    CREATE INDEX sessions_by_workout ON sessions(workout_id);
  `);
}
