import type { SQLiteDatabase } from 'expo-sqlite';

export async function createTrainingSchema(database: SQLiteDatabase) {
  await database.execAsync(`
    DROP TABLE IF EXISTS sets;
    DROP TABLE IF EXISTS workout_exercises;
    DROP TABLE IF EXISTS workouts;
    DROP TABLE IF EXISTS exercises;

    CREATE TABLE exercises (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      body_part TEXT NOT NULL CHECK (body_part IN ('chest','back','shoulders','biceps','triceps','forearms','core','glutes','quadriceps','hamstrings','calves','full_body','cardio','mobility')),
      image_url TEXT,
      default_tracking_type TEXT NOT NULL CHECK (default_tracking_type IN ('repetitions','repetitions_and_weight','duration','distance')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE workouts (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('individual','class')),
      class_type TEXT CHECK (class_type IN ('yoga','pilates','spin','hiking','barre','other')),
      duration_minutes INTEGER,
      description TEXT,
      image_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK ((kind = 'class') = (class_type IS NOT NULL))
    );

    CREATE TABLE workout_items (
      id INTEGER PRIMARY KEY NOT NULL,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      position INTEGER NOT NULL,
      superset_group TEXT,
      tracking_type TEXT NOT NULL CHECK (tracking_type IN ('repetitions','repetitions_and_weight','duration','distance')),
      rest_seconds INTEGER,
      notes TEXT
    );

    CREATE TABLE target_sets (
      id INTEGER PRIMARY KEY NOT NULL,
      workout_item_id INTEGER NOT NULL REFERENCES workout_items(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      repetitions INTEGER,
      weight_kilograms REAL,
      duration_seconds INTEGER,
      distance_meters REAL
    );

    CREATE TABLE plans (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0,1)),
      starts_on TEXT,
      created_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX plans_single_active ON plans(is_active) WHERE is_active = 1;

    CREATE TABLE plan_entries (
      id INTEGER PRIMARY KEY NOT NULL,
      plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
      time_of_day TEXT NOT NULL
    );

    CREATE TABLE sessions (
      id INTEGER PRIMARY KEY NOT NULL,
      workout_id INTEGER REFERENCES workouts(id) ON DELETE SET NULL,
      plan_entry_id INTEGER REFERENCES plan_entries(id) ON DELETE SET NULL,
      workout_name TEXT NOT NULL,
      workout_kind TEXT NOT NULL CHECK (workout_kind IN ('individual','class')),
      class_type TEXT,
      scheduled_date TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      notes TEXT,
      health_workout_uuid TEXT,
      health_average_heart_rate REAL,
      health_maximum_heart_rate REAL,
      health_active_kilocalories REAL,
      health_duration_seconds INTEGER
    );

    CREATE TABLE session_exercises (
      id INTEGER PRIMARY KEY NOT NULL,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      replaced_exercise_id INTEGER REFERENCES exercises(id),
      position INTEGER NOT NULL,
      superset_group TEXT,
      tracking_type TEXT NOT NULL
    );

    CREATE TABLE session_sets (
      id INTEGER PRIMARY KEY NOT NULL,
      session_exercise_id INTEGER NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      target_repetitions INTEGER,
      target_weight_kilograms REAL,
      target_duration_seconds INTEGER,
      target_distance_meters REAL,
      repetitions INTEGER,
      weight_kilograms REAL,
      duration_seconds INTEGER,
      distance_meters REAL,
      completed_at TEXT
    );

    CREATE TABLE profile (
      id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
      display_name TEXT,
      birth_date TEXT,
      sex TEXT CHECK (sex IN ('female','male','other')),
      height_centimetres REAL,
      goal TEXT CHECK (goal IN ('strength','hypertrophy','endurance','general_fitness','weight_loss')),
      weekly_workout_target INTEGER NOT NULL DEFAULT 4,
      daily_step_goal INTEGER NOT NULL DEFAULT 10000,
      updated_at TEXT NOT NULL
    );

    INSERT INTO profile (id, updated_at) VALUES (1, strftime('%Y-%m-%dT%H:%M:%fZ','now'));

    CREATE TABLE body_measurements (
      id INTEGER PRIMARY KEY NOT NULL,
      measured_on TEXT NOT NULL,
      weight_kilograms REAL,
      body_fat_percent REAL,
      waist_centimetres REAL,
      hip_centimetres REAL,
      chest_centimetres REAL,
      notes TEXT
    );

    CREATE TABLE health_snapshots (
      date TEXT PRIMARY KEY NOT NULL,
      steps INTEGER,
      sleep_minutes INTEGER,
      resting_heart_rate REAL,
      fetched_at TEXT NOT NULL
    );

    CREATE TABLE notifications (
      id INTEGER PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      nuggie TEXT NOT NULL,
      route TEXT,
      created_at TEXT NOT NULL,
      read_at TEXT
    );

    CREATE TABLE app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE INDEX workout_items_by_workout ON workout_items(workout_id, position);
    CREATE INDEX workout_items_by_exercise ON workout_items(exercise_id);
    CREATE INDEX target_sets_by_item ON target_sets(workout_item_id, position);
    CREATE INDEX plan_entries_by_plan_day ON plan_entries(plan_id, day_of_week, time_of_day);
    CREATE INDEX plan_entries_by_workout ON plan_entries(workout_id);
    CREATE INDEX sessions_by_scheduled_date ON sessions(scheduled_date);
    CREATE INDEX sessions_by_workout ON sessions(workout_id);
    CREATE INDEX session_exercises_by_session ON session_exercises(session_id, position);
    CREATE INDEX session_exercises_by_exercise ON session_exercises(exercise_id);
    CREATE INDEX session_sets_by_session_exercise ON session_sets(session_exercise_id, position);
    CREATE INDEX body_measurements_by_date ON body_measurements(measured_on);
  `);
}
