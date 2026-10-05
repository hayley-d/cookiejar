import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getSessionWithExercises, listCompletedSetsForExercises } from '@/database/repositories/sessionRepository';
import { detectPersonalRecords, type PersonalRecord } from '@/progress/detectPersonalRecords';
import { flattenCompletedSets } from '@/progress/flattenCompletedSets';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

export type FinishedSessionLookup =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'failed' }
  | { status: 'found'; session: SessionWithExercises; personalRecords: PersonalRecord[] };

type LoadedFinishedSession = {
  sessionId: number;
  lookup: Exclude<FinishedSessionLookup, { status: 'loading' }>;
};

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
      return { status: 'found', session, personalRecords } as const;
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
