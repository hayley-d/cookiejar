import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getWorkoutWithItems } from '@/database/repositories/workoutRepository';
import type { WorkoutWithItems } from '@/types/WorkoutWithItems';

export type WorkoutLookup =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'failed' }
  | { status: 'found'; workout: WorkoutWithItems };

export function useWorkoutWithItems(workoutId: number) {
  const database = useSQLiteContext();
  const [workoutLookup, setWorkoutLookup] = useState<WorkoutLookup>({ status: 'loading' });

  useEffect(() => {
    let isActive = true;
    getWorkoutWithItems(database, workoutId).then(
      (workout) => {
        if (isActive) {
          setWorkoutLookup(workout ? { status: 'found', workout } : { status: 'missing' });
        }
      },
      () => {
        if (isActive) {
          setWorkoutLookup({ status: 'failed' });
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, workoutId]);

  return workoutLookup;
}
