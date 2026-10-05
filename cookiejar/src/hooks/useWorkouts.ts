import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { listWorkouts } from '@/database/repositories/workoutRepository';
import type { WorkoutSummary } from '@/types/WorkoutSummary';

export function useWorkouts() {
  const database = useSQLiteContext();
  const [workouts, setWorkouts] = useState<WorkoutSummary[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      listWorkouts(database).then((loadedWorkouts) => {
        if (isActive) {
          setWorkouts(loadedWorkouts);
        }
      });
      return () => {
        isActive = false;
      };
    }, [database]),
  );

  return workouts;
}
