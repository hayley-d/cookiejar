import type { SQLiteDatabase } from "expo-sqlite";

import type { ClassType } from "@/types/ClassType";
import type { SessionSummary } from "@/types/SessionSummary";
import type { WorkoutKind } from "@/types/WorkoutKind";

type SessionSummaryRow = {
  id: number;
  workout_id: number | null;
  plan_entry_id: number | null;
  session_workout_name: string;
  session_workout_kind: WorkoutKind;
  session_class_type: ClassType | null;
  scheduled_date: string;
  started_at: string;
  finished_at: string | null;
  workout_duration_minutes: number | null;
  workout_image_url: string | null;
  workout_exercise_count: number;
};

function toSessionSummary(row: SessionSummaryRow): SessionSummary {
  return {
    id: row.id,
    planEntryId: row.plan_entry_id,
    scheduledDate: row.scheduled_date,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    workout: {
      id: row.workout_id,
      name: row.session_workout_name,
      kind: row.session_workout_kind,
      classType: row.session_class_type,
      durationMinutes: row.workout_duration_minutes,
      imageUrl: row.workout_image_url,
      exerciseCount: row.workout_exercise_count,
    },
  };
}

export async function listSessionsBetween(
  database: SQLiteDatabase,
  startDate: string,
  endDate: string,
): Promise<SessionSummary[]> {
  const rows = await database.getAllAsync<SessionSummaryRow>(
    `SELECT sessions.id, sessions.workout_id, sessions.plan_entry_id,
      sessions.workout_name AS session_workout_name, sessions.workout_kind AS session_workout_kind,
      sessions.class_type AS session_class_type, sessions.scheduled_date, sessions.started_at, sessions.finished_at,
      workouts.duration_minutes AS workout_duration_minutes, workouts.image_url AS workout_image_url,
      (SELECT COUNT(*) FROM workout_items WHERE workout_items.workout_id = sessions.workout_id) AS workout_exercise_count
    FROM sessions
    LEFT JOIN workouts ON workouts.id = sessions.workout_id
    WHERE sessions.scheduled_date >= ? AND sessions.scheduled_date <= ?
    ORDER BY sessions.scheduled_date, sessions.started_at, sessions.id`,
    startDate,
    endDate,
  );
  return rows.map(toSessionSummary);
}
