import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { countExerciseUsages, getExercise } from '@/database/repositories/exerciseRepository';
import type { Exercise } from '@/types/Exercise';

export type ExerciseLookup =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'found'; exercise: Exercise; usageCount: number };

export function useExercise(exerciseId: number) {
  const database = useSQLiteContext();
  const [exerciseLookup, setExerciseLookup] = useState<ExerciseLookup>({ status: 'loading' });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      Promise.all([getExercise(database, exerciseId), countExerciseUsages(database, exerciseId)]).then(
        ([exercise, usageCount]) => {
          if (isActive) {
            setExerciseLookup(exercise ? { status: 'found', exercise, usageCount } : { status: 'missing' });
          }
        },
      );
      return () => {
        isActive = false;
      };
    }, [database, exerciseId]),
  );

  return exerciseLookup;
}
