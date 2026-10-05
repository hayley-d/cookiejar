import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { weekPageDates } from '@/dates/weekPages';
import { getActivePlanWithEntries } from '@/database/repositories/planRepository';
import { listSessionsBetween } from '@/database/repositories/scheduleRepository';
import { buildScheduledWorkouts } from '@/plans/buildScheduledWorkouts';
import {
  emptyScheduledWeekCache,
  mergeLoadedWeeks,
  missingWeekStarts,
  scheduledWorkoutsForDate,
  type ScheduledWeek,
  type ScheduledWeekCache,
  type ScheduledWorkoutsForDateLookup,
} from '@/plans/scheduledWeekCache';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { PlanWithEntries } from '@/types/PlanWithEntries';

export type ScheduledWeeks = {
  lookupDate: (date: string) => ScheduledWorkoutsForDateLookup;
};

type CacheSnapshot = {
  resetKey: string;
  cache: ScheduledWeekCache;
};

const failedWeek: ScheduledWeek = { outcome: 'failed' };

export function useScheduledWeeks(visibleWeekStart: string): ScheduledWeeks {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [snapshot, setSnapshot] = useState<CacheSnapshot>({ resetKey: '0:0', cache: emptyScheduledWeekCache });
  const latestResetKey = useRef('');
  const loadingWeekKeys = useRef(new Set<string>());

  const resetKey = `${dataVersion}:${focusCount}`;
  const cache = snapshot.resetKey === resetKey ? snapshot.cache : emptyScheduledWeekCache;

  useEffect(() => {
    latestResetKey.current = resetKey;
    const weekStartsToLoad = missingWeekStarts(cache, visibleWeekStart).filter(
      (weekStart) => !loadingWeekKeys.current.has(`${resetKey}|${weekStart}`),
    );
    if (weekStartsToLoad.length === 0) {
      return;
    }
    for (const weekStart of weekStartsToLoad) {
      loadingWeekKeys.current.add(`${resetKey}|${weekStart}`);
    }

    async function loadWeeks() {
      const loadedWeeks = new Map<string, ScheduledWeek>();
      let activePlan: PlanWithEntries | null = null;
      let didLoadActivePlan = true;
      try {
        activePlan = await getActivePlanWithEntries(database);
      } catch {
        didLoadActivePlan = false;
      }

      await Promise.all(
        weekStartsToLoad.map(async (weekStart) => {
          if (!didLoadActivePlan) {
            loadedWeeks.set(weekStart, failedWeek);
            return;
          }
          const dates = weekPageDates(weekStart);
          const startDate = dates[0];
          const endDate = dates[dates.length - 1];
          try {
            const sessions = await listSessionsBetween(database, startDate, endDate);
            loadedWeeks.set(weekStart, {
              outcome: 'ready',
              scheduledWorkoutsByDate: buildScheduledWorkouts({ startDate, endDate, activePlan, sessions }),
            });
          } catch {
            loadedWeeks.set(weekStart, failedWeek);
          }
        }),
      );

      for (const weekStart of weekStartsToLoad) {
        loadingWeekKeys.current.delete(`${resetKey}|${weekStart}`);
      }
      if (latestResetKey.current !== resetKey) {
        return;
      }
      setSnapshot((previousSnapshot) => ({
        resetKey,
        cache: mergeLoadedWeeks(
          previousSnapshot.resetKey === resetKey ? previousSnapshot.cache : emptyScheduledWeekCache,
          loadedWeeks,
        ),
      }));
    }

    loadWeeks();
  }, [database, visibleWeekStart, resetKey, cache]);

  const lookupDate = useCallback((date: string) => scheduledWorkoutsForDate(cache, date), [cache]);

  return { lookupDate };
}
