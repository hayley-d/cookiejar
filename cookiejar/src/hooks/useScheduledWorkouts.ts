import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getActivePlanWithEntries } from '@/database/repositories/planRepository';
import { listSessionsBetween } from '@/database/repositories/scheduleRepository';
import { buildScheduledWorkouts } from '@/plans/buildScheduledWorkouts';
import type { ScheduledWorkoutsForDateLookup } from '@/plans/scheduledWeekCache';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

export type ScheduledWorkoutsLookup =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; scheduledWorkoutsByDate: Map<string, ScheduledWorkout[]> };

export type { ScheduledWorkoutsForDateLookup };

type LoadedRange = {
  startDate: string;
  endDate: string;
  outcome: 'failed' | 'ready';
  scheduledWorkoutsByDate: Map<string, ScheduledWorkout[]>;
};

export function useScheduledWorkouts(startDate: string, endDate: string): ScheduledWorkoutsLookup {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const [focusCount, setFocusCount] = useState(0);
  const [loadedRange, setLoadedRange] = useState<LoadedRange | null>(null);
  const hasFocusedBefore = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedBefore.current) {
        hasFocusedBefore.current = true;
        return;
      }
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
          setLoadedRange({
            startDate,
            endDate,
            outcome: 'ready',
            scheduledWorkoutsByDate: buildScheduledWorkouts({ startDate, endDate, activePlan, sessions }),
          });
        }
      },
      () => {
        if (isActive) {
          setLoadedRange({ startDate, endDate, outcome: 'failed', scheduledWorkoutsByDate: new Map() });
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, startDate, endDate, dataVersion, focusCount]);

  if (loadedRange === null || loadedRange.startDate !== startDate || loadedRange.endDate !== endDate) {
    return { status: 'loading' };
  }
  if (loadedRange.outcome === 'failed') {
    return { status: 'failed' };
  }
  return { status: 'ready', scheduledWorkoutsByDate: loadedRange.scheduledWorkoutsByDate };
}

export function useScheduledWorkoutsForDate(date: string): ScheduledWorkoutsForDateLookup {
  const scheduledWorkoutsLookup = useScheduledWorkouts(date, date);
  if (scheduledWorkoutsLookup.status !== 'ready') {
    return scheduledWorkoutsLookup;
  }
  return {
    status: 'ready',
    scheduledWorkouts: scheduledWorkoutsLookup.scheduledWorkoutsByDate.get(date) ?? [],
  };
}
