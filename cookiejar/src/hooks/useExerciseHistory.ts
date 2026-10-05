import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getExercise } from '@/database/repositories/exerciseRepository';
import { listFinishedSessionSetsForExercise } from '@/database/repositories/progressRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { buildExerciseHistory, type ExerciseHistory } from '@/progress/buildExerciseSessions';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { Exercise } from '@/types/Exercise';

type LoadedExerciseHistory = ExerciseHistory & {
  exercise: Exercise | null;
};

export function useExerciseHistory(exerciseId: number) {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [history, setHistory] = useState<LoadedExerciseHistory | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useEffect(() => {
    let isActive = true;
    Promise.all([getExercise(database, exerciseId), listFinishedSessionSetsForExercise(database, exerciseId)]).then(
      ([exercise, historySets]) => {
        if (isActive) {
          setHistory({ exercise, ...buildExerciseHistory(historySets) });
          setHasLoadFailed(false);
        }
      },
      () => {
        if (isActive) {
          setHasLoadFailed(true);
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, dataVersion, exerciseId, focusCount]);

  return {
    exercise: history?.exercise ?? null,
    sessions: history?.sessions ?? null,
    recordSetIds: history?.recordSetIds ?? null,
    recordDates: history?.recordDates ?? null,
    seriesSets: history?.seriesSets ?? null,
    isLoaded: history !== null,
    hasLoadFailed,
  };
}
