import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getWorkoutWithItems } from '@/database/repositories/workoutRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { WorkoutWithItems } from '@/types/WorkoutWithItems';

export type WorkoutLookup =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'failed' }
  | { status: 'found'; workout: WorkoutWithItems };

type LoadedWorkout = {
  workoutId: number;
  lookup: Exclude<WorkoutLookup, { status: 'loading' }>;
};

export function useWorkoutWithItems(workoutId: number): WorkoutLookup {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [loadedWorkout, setLoadedWorkout] = useState<LoadedWorkout | null>(null);

  useEffect(() => {
    let isActive = true;
    if (!Number.isInteger(workoutId)) {
      return;
    }
    getWorkoutWithItems(database, workoutId).then(
      (workout) => {
        if (isActive) {
          setLoadedWorkout({
            workoutId,
            lookup: workout ? { status: 'found', workout } : { status: 'missing' },
          });
        }
      },
      () => {
        if (isActive) {
          setLoadedWorkout((previousLoadedWorkout) =>
            previousLoadedWorkout?.workoutId === workoutId && previousLoadedWorkout.lookup.status === 'found'
              ? previousLoadedWorkout
              : { workoutId, lookup: { status: 'failed' } },
          );
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, workoutId, dataVersion, focusCount]);

  if (!Number.isInteger(workoutId)) {
    return { status: 'missing' };
  }
  if (loadedWorkout === null || loadedWorkout.workoutId !== workoutId) {
    return { status: 'loading' };
  }
  return loadedWorkout.lookup;
}
