import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState, type Dispatch } from 'react';

import { getExercise } from '@/database/repositories/exerciseRepository';
import {
  beginExercisePick,
  createExercisePickRequestIdentifier,
  useExercisePickResult,
  type ExercisePickResult,
} from '@/stores/exercisePickerStore';
import type { Exercise } from '@/types/Exercise';
import type { WorkoutEditorAction } from '@/workouts/workoutEditorReducer';

type PendingPick = { exerciseIds: number[]; asSuperset: boolean; replacedItemKey: string | null };

type UseExercisePicksOptions = { shouldPickOnOpen: boolean; dispatch: Dispatch<WorkoutEditorAction> };

function startExercisePick() {
  const requestIdentifier = createExercisePickRequestIdentifier();
  beginExercisePick(requestIdentifier);
  return requestIdentifier;
}

function openExercisePicker(requestIdentifier: string, mode: 'multiple' | 'single', excludedExerciseIds: number[]) {
  router.push({
    pathname: '/exercises/picker',
    params: { requestIdentifier, mode, excludeExerciseIds: excludedExerciseIds.join(',') },
  });
}

function isExercise(exercise: Exercise | null): exercise is Exercise {
  return exercise !== null;
}

export function useExercisePicks({ shouldPickOnOpen, dispatch }: UseExercisePicksOptions) {
  const database = useSQLiteContext();
  const [openingRequestIdentifier] = useState(() => (shouldPickOnOpen ? startExercisePick() : null));
  const [pickRequestIdentifier, setPickRequestIdentifier] = useState(openingRequestIdentifier);
  const [replacedItemKey, setReplacedItemKey] = useState<string | null>(null);
  const pickResult = useExercisePickResult(pickRequestIdentifier);
  const [lastPickResult, setLastPickResult] = useState<ExercisePickResult | null>(null);
  const [pendingPick, setPendingPick] = useState<PendingPick | null>(null);
  const hasOpenedPickerOnOpen = useRef(false);

  if (pickResult !== null && pickResult !== lastPickResult) {
    setLastPickResult(pickResult);
    setPendingPick({ exerciseIds: pickResult.exerciseIds, asSuperset: pickResult.asSuperset, replacedItemKey });
  }

  useEffect(() => {
    if (openingRequestIdentifier === null || hasOpenedPickerOnOpen.current) {
      return;
    }
    hasOpenedPickerOnOpen.current = true;
    openExercisePicker(openingRequestIdentifier, 'multiple', []);
  }, [openingRequestIdentifier]);

  useEffect(() => {
    if (pendingPick === null) {
      return;
    }
    let isActive = true;
    Promise.all(pendingPick.exerciseIds.map((exerciseId) => getExercise(database, exerciseId))).then((exercises) => {
      if (!isActive) {
        return;
      }
      const pickedExercises = exercises.filter(isExercise);
      if (pendingPick.replacedItemKey === null) {
        dispatch({ type: 'exercisesAdded', exercises: pickedExercises, asSuperset: pendingPick.asSuperset });
      } else if (pickedExercises.length > 0) {
        dispatch({ type: 'exerciseReplaced', itemKey: pendingPick.replacedItemKey, exercise: pickedExercises[0] });
      }
      setPendingPick(null);
    });
    return () => {
      isActive = false;
    };
  }, [database, dispatch, pendingPick]);

  const addExercises = (excludedExerciseIds: number[]) => {
    const requestIdentifier = startExercisePick();
    setReplacedItemKey(null);
    setPickRequestIdentifier(requestIdentifier);
    openExercisePicker(requestIdentifier, 'multiple', excludedExerciseIds);
  };

  const replaceExercise = (itemKey: string, excludedExerciseIds: number[]) => {
    const requestIdentifier = startExercisePick();
    setReplacedItemKey(itemKey);
    setPickRequestIdentifier(requestIdentifier);
    openExercisePicker(requestIdentifier, 'single', excludedExerciseIds);
  };

  return { isLoadingPick: pendingPick !== null, addExercises, replaceExercise };
}
