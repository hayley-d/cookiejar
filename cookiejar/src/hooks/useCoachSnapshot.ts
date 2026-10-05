import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { buildCoachSnapshot, coachSnapshotDateRanges } from '@/coach/buildCoachSnapshot';
import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { getLatestBodyMeasurement } from '@/database/repositories/bodyMeasurementRepository';
import { listExercises } from '@/database/repositories/exerciseRepository';
import { getHealthSnapshotsBetween } from '@/database/repositories/healthSnapshotRepository';
import { getActivePlanWithEntries } from '@/database/repositories/planRepository';
import { getProfile } from '@/database/repositories/profileRepository';
import { getTrainingTotals, listAllFinishedSessionSets } from '@/database/repositories/progressRepository';
import { listSessionsBetween } from '@/database/repositories/scheduleRepository';
import { useDataVersion } from '@/stores/dataVersionStore';

export type CoachSnapshotLookup =
  { status: 'loading' } | { status: 'failed' } | { status: 'ready'; snapshot: CoachSnapshot };

export function useCoachSnapshot(): CoachSnapshotLookup {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const [lookup, setLookup] = useState<CoachSnapshotLookup>({ status: 'loading' });

  useEffect(() => {
    let isActive = true;
    const now = new Date();
    const dateRanges = coachSnapshotDateRanges(now);
    Promise.all([
      getProfile(database),
      getActivePlanWithEntries(database),
      getTrainingTotals(database, null, dateRanges.today),
      listAllFinishedSessionSets(database),
      listSessionsBetween(database, dateRanges.scheduleStartDate, dateRanges.weekEndDate),
      getHealthSnapshotsBetween(database, dateRanges.recentStartDate, dateRanges.today),
      getLatestBodyMeasurement(database),
      listExercises(database),
    ]).then(
      ([
        profile,
        activePlan,
        lifetimeTotals,
        finishedSessionSets,
        scheduledSessions,
        healthSnapshots,
        latestBodyMeasurement,
        exercises,
      ]) => {
        if (isActive) {
          setLookup({
            status: 'ready',
            snapshot: buildCoachSnapshot({
              now,
              profile,
              activePlan,
              finishedSessionCount: lifetimeTotals.workoutCount,
              finishedSessionSets,
              scheduledSessions,
              healthSnapshots,
              latestBodyMeasurement,
              exercises,
            }),
          });
        }
      },
      () => {
        if (isActive) {
          setLookup({ status: 'failed' });
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, dataVersion]);

  return lookup;
}
