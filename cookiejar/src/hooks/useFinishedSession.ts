import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { listFinishedActivityLogs, listFinishedSwimLogs } from '@/database/repositories/progressRepository';
import { getSessionWithExercises, listCompletedSetsForExercises } from '@/database/repositories/sessionRepository';
import { detectActivityBests, type ActivityBestKind } from '@/progress/detectActivityBests';
import { detectSwimBests, type SwimBestKind } from '@/progress/detectSwimBests';
import { detectPersonalRecords, type PersonalRecord } from '@/progress/detectPersonalRecords';
import { flattenCompletedSets } from '@/progress/flattenCompletedSets';
import { elapsedSecondsBetween } from '@/sessions/calculateSessionTotals';
import { flattenSwimRepetitions, swumDistanceByStroke, swumDistance } from '@/swimming/swimSessionTotals';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

export type FinishedSessionLookup =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'failed' }
  | { status: 'found'; session: SessionWithExercises; personalRecords: PersonalRecord[]; activityBests: ActivityBestKind[]; swimBests: SwimBestKind[] };

type LoadedFinishedSession = {
  sessionId: number;
  lookup: Exclude<FinishedSessionLookup, { status: 'loading' }>;
};

async function findActivityBests(database: SQLiteDatabase, session: SessionWithExercises): Promise<ActivityBestKind[]> {
  if (session.workoutKind !== 'activity' || session.activityType === null || session.finishedAt === null) {
    return [];
  }
  const earlierLogs = await listFinishedActivityLogs(database, {
    activityType: session.activityType,
    startedBefore: session.startedAt,
  });
  return detectActivityBests(
    {
      activityType: session.activityType,
      startedAt: session.startedAt,
      durationSeconds: elapsedSecondsBetween(session.startedAt, new Date(session.finishedAt)),
      distanceMeters: session.distanceMeters,
      elevationGainMeters: session.elevationGainMeters,
    },
    earlierLogs,
  );
}

async function findSwimBests(database: SQLiteDatabase, session: SessionWithExercises): Promise<SwimBestKind[]> {
  if (session.workoutKind !== 'swim' || session.swim === null || session.finishedAt === null) {
    return [];
  }
  const repetitionRecords = flattenSwimRepetitions(session.swim.sections);
  const earlierLogs = await listFinishedSwimLogs(database, { startedBefore: session.startedAt });
  return detectSwimBests(
    {
      startedAt: session.startedAt,
      durationSeconds: elapsedSecondsBetween(session.startedAt, new Date(session.finishedAt)),
      distanceMeters: swumDistance(repetitionRecords),
      strokeDistances: swumDistanceByStroke(repetitionRecords),
    },
    earlierLogs,
  );
}

export function useFinishedSession(sessionId: number): FinishedSessionLookup {
  const database = useSQLiteContext();
  const [loaded, setLoaded] = useState<LoadedFinishedSession | null>(null);
  const dataVersion = useDataVersion();

  useEffect(() => {
    let isActive = true;
    if (!Number.isInteger(sessionId)) {
      return undefined;
    }
    async function load() {
      const session = await getSessionWithExercises(database, sessionId);
      if (session === null) {
        return { status: 'missing' } as const;
      }
      const exerciseIds = [...new Set(session.exercises.map((sessionExercise) => sessionExercise.exerciseId))];
      const earlierSets = await listCompletedSetsForExercises(database, exerciseIds, session.startedAt);
      const personalRecords = detectPersonalRecords(flattenCompletedSets(session), earlierSets);
      const activityBests = await findActivityBests(database, session);
      const swimBests = await findSwimBests(database, session);
      return { status: 'found', session, personalRecords, activityBests, swimBests } as const;
    }
    load().then(
      (lookup) => {
        if (isActive) {
          setLoaded({ sessionId, lookup });
        }
      },
      () => {
        if (isActive) {
          setLoaded({ sessionId, lookup: { status: 'failed' } });
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, sessionId, dataVersion]);

  if (!Number.isInteger(sessionId)) {
    return { status: 'missing' };
  }
  if (loaded === null || loaded.sessionId !== sessionId) {
    return { status: 'loading' };
  }
  return loaded.lookup;
}
