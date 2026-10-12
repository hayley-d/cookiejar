import type { SQLiteDatabase } from 'expo-sqlite';

export async function addSwimming(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE exercises_rebuilt (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      body_part TEXT NOT NULL CHECK (body_part IN ('chest','back','shoulders','biceps','triceps','forearms','core','glutes','quadriceps','hamstrings','calves','full_body','cardio','mobility','swimming')),
      image_url TEXT,
      video_url TEXT,
      default_tracking_type TEXT NOT NULL CHECK (default_tracking_type IN ('repetitions','repetitions_and_weight','repetitions_and_assistance','duration','distance')),
      created_at TEXT NOT NULL,
      notes TEXT
    );

    INSERT INTO exercises_rebuilt (id, name, body_part, image_url, video_url, default_tracking_type, created_at, notes)
    SELECT id, name, body_part, image_url, video_url, default_tracking_type, created_at, notes FROM exercises;

    DROP TABLE exercises;
    ALTER TABLE exercises_rebuilt RENAME TO exercises;

    CREATE TABLE workouts_rebuilt (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('individual','class','activity','swim')),
      class_type TEXT CHECK (class_type IN ('yoga','pilates','spin','barre','other')),
      activity_type TEXT CHECK (activity_type IN ('hike','run','walk')),
      duration_minutes INTEGER,
      pool_length_meters INTEGER CHECK (pool_length_meters IN (25, 50)),
      description TEXT,
      image_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK ((kind = 'class') = (class_type IS NOT NULL)),
      CHECK ((kind = 'activity') = (activity_type IS NOT NULL)),
      CHECK ((kind = 'swim') = (pool_length_meters IS NOT NULL))
    );

    INSERT INTO workouts_rebuilt
      (id, name, kind, class_type, activity_type, duration_minutes, description, image_url, created_at, updated_at)
    SELECT id, name, kind, class_type, activity_type, duration_minutes, description, image_url, created_at, updated_at
    FROM workouts;

    DROP TABLE workouts;
    ALTER TABLE workouts_rebuilt RENAME TO workouts;

    CREATE TABLE sessions_rebuilt (
      id INTEGER PRIMARY KEY NOT NULL,
      workout_id INTEGER REFERENCES workouts(id) ON DELETE SET NULL,
      plan_entry_id INTEGER REFERENCES plan_entries(id) ON DELETE SET NULL,
      workout_name TEXT NOT NULL,
      workout_kind TEXT NOT NULL CHECK (workout_kind IN ('individual','class','activity','swim')),
      class_type TEXT,
      activity_type TEXT CHECK (activity_type IN ('hike','run','walk')),
      pool_length_meters INTEGER CHECK (pool_length_meters IN (25, 50)),
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
        health_active_kilocalories, health_duration_seconds, distance_meters, elevation_gain_meters,
        active_kilocalories, average_heart_rate)
    SELECT
      id, workout_id, plan_entry_id, workout_name, workout_kind, class_type, activity_type, scheduled_date, started_at,
      finished_at, notes, health_workout_uuid, health_average_heart_rate, health_maximum_heart_rate,
      health_active_kilocalories, health_duration_seconds, distance_meters, elevation_gain_meters,
      active_kilocalories, average_heart_rate
    FROM sessions;

    DROP TABLE sessions;
    ALTER TABLE sessions_rebuilt RENAME TO sessions;

    CREATE INDEX sessions_by_scheduled_date ON sessions(scheduled_date);
    CREATE INDEX sessions_by_workout ON sessions(workout_id);

    CREATE TABLE swim_sections (
      id INTEGER PRIMARY KEY NOT NULL,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE swim_blocks (
      id INTEGER PRIMARY KEY NOT NULL,
      section_id INTEGER NOT NULL REFERENCES swim_sections(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      rounds INTEGER NOT NULL CHECK (rounds >= 1),
      rest_after_seconds INTEGER
    );

    CREATE TABLE swim_sets (
      id INTEGER PRIMARY KEY NOT NULL,
      block_id INTEGER NOT NULL REFERENCES swim_blocks(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      repetitions INTEGER NOT NULL CHECK (repetitions >= 1),
      distance_meters INTEGER NOT NULL CHECK (distance_meters > 0),
      rest_mode TEXT NOT NULL CHECK (rest_mode IN ('fixed','send_off')),
      rest_seconds INTEGER,
      send_off_seconds INTEGER,
      rest_after_seconds INTEGER,
      notes TEXT
    );

    CREATE TABLE swim_set_equipment (
      swim_set_id INTEGER NOT NULL REFERENCES swim_sets(id) ON DELETE CASCADE,
      equipment TEXT NOT NULL CHECK (equipment IN ('fins','paddles','pull_buoy','kickboard')),
      PRIMARY KEY (swim_set_id, equipment)
    );

    CREATE TABLE session_swim_sections (
      id INTEGER PRIMARY KEY NOT NULL,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE session_swim_blocks (
      id INTEGER PRIMARY KEY NOT NULL,
      section_id INTEGER NOT NULL REFERENCES session_swim_sections(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      rounds INTEGER NOT NULL CHECK (rounds >= 1),
      rest_after_seconds INTEGER
    );

    CREATE TABLE session_swim_sets (
      id INTEGER PRIMARY KEY NOT NULL,
      block_id INTEGER NOT NULL REFERENCES session_swim_blocks(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      exercise_id INTEGER REFERENCES exercises(id),
      exercise_name TEXT NOT NULL,
      repetitions INTEGER NOT NULL CHECK (repetitions >= 1),
      distance_meters INTEGER NOT NULL CHECK (distance_meters > 0),
      rest_mode TEXT NOT NULL CHECK (rest_mode IN ('fixed','send_off')),
      rest_seconds INTEGER,
      send_off_seconds INTEGER,
      rest_after_seconds INTEGER,
      notes TEXT
    );

    CREATE TABLE session_swim_set_equipment (
      session_swim_set_id INTEGER NOT NULL REFERENCES session_swim_sets(id) ON DELETE CASCADE,
      equipment TEXT NOT NULL CHECK (equipment IN ('fins','paddles','pull_buoy','kickboard')),
      PRIMARY KEY (session_swim_set_id, equipment)
    );

    CREATE TABLE session_swim_repetitions (
      id INTEGER PRIMARY KEY NOT NULL,
      session_swim_set_id INTEGER NOT NULL REFERENCES session_swim_sets(id) ON DELETE CASCADE,
      round_index INTEGER NOT NULL,
      repetition_index INTEGER NOT NULL,
      completed_at TEXT,
      UNIQUE (session_swim_set_id, round_index, repetition_index)
    );

    CREATE INDEX swim_sections_by_workout ON swim_sections(workout_id, position);
    CREATE INDEX swim_blocks_by_section ON swim_blocks(section_id, position);
    CREATE INDEX swim_sets_by_block ON swim_sets(block_id, position);
    CREATE INDEX swim_sets_by_exercise ON swim_sets(exercise_id);
    CREATE INDEX session_swim_sections_by_session ON session_swim_sections(session_id, position);
    CREATE INDEX session_swim_blocks_by_section ON session_swim_blocks(section_id, position);
    CREATE INDEX session_swim_sets_by_block ON session_swim_sets(block_id, position);
    CREATE INDEX session_swim_sets_by_exercise ON session_swim_sets(exercise_id);
  `);
}
