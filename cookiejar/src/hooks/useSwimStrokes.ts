import { useMemo } from 'react';

import { useExercises } from '@/hooks/useExercises';
import type { SwimStroke } from '@/swimming/swimEditorReducer';

export function useSwimStrokes(): SwimStroke[] {
  const exercises = useExercises();
  return useMemo(
    () =>
      (exercises ?? [])
        .filter((exercise) => exercise.bodyPart === 'swimming')
        .map((exercise) => ({ id: exercise.id, name: exercise.name })),
    [exercises],
  );
}
