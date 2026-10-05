import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getActivePlanWithEntries } from '@/database/repositories/planRepository';
import { listSessionsBetween } from '@/database/repositories/scheduleRepository';
import { buildScheduledWorkouts } from '@/plans/buildScheduledWorkouts';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

export type ScheduledWorkoutsLookup =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; scheduledWorkoutsByDate: Map<string, ScheduledWorkout[]>; hasActivePlan: boolean };

export type UseScheduledWorkoutsForDateReadyLookup = {
  status: 'ready';
  scheduledWorkouts: ScheduledWorkout[];
  hasActivePlan: boolean;
};

export type UseScheduledWorkoutsForDateLookup =
  | { status: 'loading' }
  | { status: 'failed' }
  | UseScheduledWorkoutsForDateReadyLookup;

type LoadedRange = {
  startDate: string;
  endDate: string;
  outcome: 'failed' | 'ready';
  scheduledWorkoutsByDate: Map<string, ScheduledWorkout[]>;
  hasActivePlan: boolean;
};

export function useScheduledWorkouts(startDate: string, endDate: string): ScheduledWorkoutsLookup {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [loadedRange, setLoadedRange] = useState<LoadedRange | null>(null);

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
            hasActivePlan: activePlan !== null,
          });
        }
      },
      () => {
        if (isActive) {
          setLoadedRange({
            startDate,
            endDate,
            outcome: 'failed',
            scheduledWorkoutsByDate: new Map(),
            hasActivePlan: false,
          });
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
  return {
    status: 'ready',
    scheduledWorkoutsByDate: loadedRange.scheduledWorkoutsByDate,
    hasActivePlan: loadedRange.hasActivePlan,
  };
}

export function useScheduledWorkoutsForDate(date: string): UseScheduledWorkoutsForDateLookup {
  const scheduledWorkoutsLookup = useScheduledWorkouts(date, date);
  if (scheduledWorkoutsLookup.status !== 'ready') {
    return scheduledWorkoutsLookup;
  }
  return {
    status: 'ready',
    scheduledWorkouts: scheduledWorkoutsLookup.scheduledWorkoutsByDate.get(date) ?? [],
    hasActivePlan: scheduledWorkoutsLookup.hasActivePlan,
  };
}
