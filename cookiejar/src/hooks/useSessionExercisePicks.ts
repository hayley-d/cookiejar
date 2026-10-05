import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import {
  beginExercisePick,
  createExercisePickRequestIdentifier,
  useExercisePickResult,
} from '@/stores/exercisePickerStore';

type UseSessionExercisePicksOptions = {
  onAddExercises: (exerciseIds: number[]) => void;
  onReplaceExercise: (sessionExerciseId: number, newExerciseId: number) => void;
};

export function useSessionExercisePicks({ onAddExercises, onReplaceExercise }: UseSessionExercisePicksOptions) {
  const [pickRequestIdentifier, setPickRequestIdentifier] = useState<string | null>(null);
  const replacedSessionExerciseId = useRef<number | null>(null);
  const pickResult = useExercisePickResult(pickRequestIdentifier);
  const latestHandlers = useRef({ onAddExercises, onReplaceExercise });
  latestHandlers.current = { onAddExercises, onReplaceExercise };

  useEffect(() => {
    if (pickResult === null || pickResult.exerciseIds.length === 0) {
      return;
    }
    const sessionExerciseId = replacedSessionExerciseId.current;
    if (sessionExerciseId === null) {
      latestHandlers.current.onAddExercises(pickResult.exerciseIds);
    } else {
      latestHandlers.current.onReplaceExercise(sessionExerciseId, pickResult.exerciseIds[0]);
    }
  }, [pickResult]);

  const openPicker = (mode: 'multiple' | 'single', excludedExerciseIds: number[]) => {
    const requestIdentifier = createExercisePickRequestIdentifier();
    beginExercisePick(requestIdentifier);
    setPickRequestIdentifier(requestIdentifier);
    router.push({
      pathname: '/exercises/picker',
      params: { requestIdentifier, mode, excludeExerciseIds: excludedExerciseIds.join(',') },
    });
  };

  const addExercises = (excludedExerciseIds: number[]) => {
    replacedSessionExerciseId.current = null;
    openPicker('multiple', excludedExerciseIds);
  };

  const replaceExercise = (sessionExerciseId: number, excludedExerciseIds: number[]) => {
    replacedSessionExerciseId.current = sessionExerciseId;
    openPicker('single', excludedExerciseIds);
  };

  return { addExercises, replaceExercise };
}
