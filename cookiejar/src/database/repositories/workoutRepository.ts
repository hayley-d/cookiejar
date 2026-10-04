import type { SQLiteDatabase } from 'expo-sqlite';

import type { Workout } from '@/types/Workout';

type WorkoutRow = {
  id: number;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
};

function toWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    notes: row.notes,
  };
}

export async function listWorkouts(database: SQLiteDatabase): Promise<Workout[]> {
  const rows = await database.getAllAsync<WorkoutRow>(
    'SELECT id, started_at, finished_at, notes FROM workouts ORDER BY started_at DESC',
  );
  return rows.map(toWorkout);
}
