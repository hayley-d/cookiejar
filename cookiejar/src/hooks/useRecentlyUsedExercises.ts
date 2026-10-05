import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { listRecentlyUsedExercises } from '@/database/repositories/exerciseRepository';
import type { Exercise } from '@/types/Exercise';

export function useRecentlyUsedExercises() {
  const database = useSQLiteContext();
  const [exercises, setExercises] = useState<Exercise[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      listRecentlyUsedExercises(database).then((loadedExercises) => {
        if (isActive) {
          setExercises(loadedExercises);
        }
      });
      return () => {
        isActive = false;
      };
    }, [database]),
  );

  return exercises;
}
