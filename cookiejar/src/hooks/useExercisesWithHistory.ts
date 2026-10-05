import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { listExercisesWithHistory } from '@/database/repositories/progressRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { ExerciseWithHistory } from '@/types/ExerciseHistory';

export function useExercisesWithHistory() {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [exercises, setExercises] = useState<ExerciseWithHistory[] | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useEffect(() => {
    let isActive = true;
    listExercisesWithHistory(database).then(
      (loadedExercises) => {
        if (isActive) {
          setExercises(loadedExercises);
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
  }, [database, dataVersion, focusCount]);

  return { exercises, hasLoadFailed };
}
