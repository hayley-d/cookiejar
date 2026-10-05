import type { SQLiteDatabase } from 'expo-sqlite';

import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
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
