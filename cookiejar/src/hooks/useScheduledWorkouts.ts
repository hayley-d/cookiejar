import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import { getActivePlanWithEntries } from '@/database/repositories/planRepository';
import { listSessionsBetween } from '@/database/repositories/scheduleRepository';
import { buildScheduledWorkouts } from '@/plans/buildScheduledWorkouts';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

export function useScheduledWorkouts(startDate: string, endDate: string) {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const [focusCount, setFocusCount] = useState(0);
  const [scheduledWorkoutsByDate, setScheduledWorkoutsByDate] = useState<Map<
    string,
    ScheduledWorkout[]
  > | null>(null);

  useFocusEffect(
    useCallback(() => {
      setFocusCount((previousFocusCount) => previousFocusCount + 1);
    }, []),
  );

  useEffect(() => {
    let isActive = true;
    Promise.all([
      getActivePlanWithEntries(database),
      listSessionsBetween(database, startDate, endDate),
    ]).then(
      ([activePlan, sessions]) => {
        if (isActive) {
          setScheduledWorkoutsByDate(
            buildScheduledWorkouts({
              startDate,
              endDate,
              activePlan,
              sessions,
            }),
          );
        }
      },
      () => {},
    );
    return () => {
      isActive = false;
    };
  }, [database, startDate, endDate, dataVersion, focusCount]);

  return scheduledWorkoutsByDate;
}

export function useScheduledWorkoutsForDate(date: string) {
  const scheduledWorkoutsByDate = useScheduledWorkouts(date, date);
  return scheduledWorkoutsByDate === null
    ? null
    : (scheduledWorkoutsByDate.get(date) ?? []);
}
