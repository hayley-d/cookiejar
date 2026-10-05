import type { SQLiteDatabase } from 'expo-sqlite';

import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import type { TrackingType } from '@/types/TrackingType';
import type { FinishedSessionSet } from '@/types/FinishedSessionSet';
import type { TrainingTotals } from '@/types/TrainingTotals';

type SessionTotalsRow = {
  workout_count: number;
  time_trained_seconds: number | null;
};

type VolumeRow = {
  volume_kilograms: number | null;
};

const earliestInstant = '0000-01-01T00:00:00.000Z';

export async function getTrainingTotals(
  database: SQLiteDatabase,
  startDate: string | null,
  endDate: string,
): Promise<TrainingTotals> {
  const rangeStart = startDate === null ? earliestInstant : parseLocalDateString(startDate).toISOString();
  const rangeEnd = addDays(parseLocalDateString(endDate), 1).toISOString();

  const sessionTotals = await database.getFirstAsync<SessionTotalsRow>(
    `SELECT COUNT(*) AS workout_count,
      SUM(ROUND((julianday(finished_at) - julianday(started_at)) * 86400)) AS time_trained_seconds
    FROM sessions
    WHERE finished_at IS NOT NULL AND started_at >= ? AND started_at < ?`,
    rangeStart,
    rangeEnd,
  );
  const volumeTotals = await database.getFirstAsync<VolumeRow>(
    `SELECT SUM(session_sets.weight_kilograms * session_sets.repetitions) AS volume_kilograms
    FROM session_sets
    JOIN session_exercises ON session_exercises.id = session_sets.session_exercise_id
    JOIN sessions ON sessions.id = session_exercises.session_id
    WHERE session_exercises.tracking_type = 'repetitions_and_weight'
      AND session_sets.completed_at IS NOT NULL
      AND session_sets.weight_kilograms IS NOT NULL
      AND session_sets.repetitions IS NOT NULL
      AND sessions.finished_at IS NOT NULL
      AND sessions.started_at >= ? AND sessions.started_at < ?`,
    rangeStart,
    rangeEnd,
  );

  return {
    workoutCount: sessionTotals?.workout_count ?? 0,
    timeTrainedSeconds: Math.max(0, sessionTotals?.time_trained_seconds ?? 0),
    volumeKilograms: volumeTotals?.volume_kilograms ?? 0,
  };
}

type FinishedSessionSetRow = {
  session_id: number;
  started_at: string;
  workout_name: string;
  exercise_id: number;
  exercise_name: string;
  exercise_image_url: string | null;
  tracking_type: TrackingType;
  repetitions: number | null;
  weight_kilograms: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
};

export async function listAllFinishedSessionSets(database: SQLiteDatabase): Promise<FinishedSessionSet[]> {
  const rows = await database.getAllAsync<FinishedSessionSetRow>(
    `SELECT sessions.id AS session_id, sessions.started_at, sessions.workout_name,
      session_exercises.exercise_id, exercises.name AS exercise_name, exercises.image_url AS exercise_image_url,
      session_exercises.tracking_type, session_sets.repetitions, session_sets.weight_kilograms,
      session_sets.duration_seconds, session_sets.distance_meters
    FROM session_sets
    JOIN session_exercises ON session_exercises.id = session_sets.session_exercise_id
    JOIN sessions ON sessions.id = session_exercises.session_id
    JOIN exercises ON exercises.id = session_exercises.exercise_id
    WHERE session_sets.completed_at IS NOT NULL
      AND sessions.finished_at IS NOT NULL
    ORDER BY sessions.started_at, sessions.id, session_exercises.position, session_exercises.id,
      session_sets.position, session_sets.id`,
  );
  return rows.map((row) => ({
    sessionId: row.session_id,
    startedAt: row.started_at,
    workoutName: row.workout_name,
    exerciseName: row.exercise_name,
    exerciseImageUrl: row.exercise_image_url,
    set: {
      exerciseId: row.exercise_id,
      trackingType: row.tracking_type,
      repetitions: row.repetitions,
      weightKilograms: row.weight_kilograms,
      durationSeconds: row.duration_seconds,
      distanceMeters: row.distance_meters,
    },
  }));
}
