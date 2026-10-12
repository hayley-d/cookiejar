import { useMemo } from 'react';

import { useExercises } from '@/hooks/useExercises';
import { sortSwimStrokes } from '@/swimming/sortSwimStrokes';
import type { SwimStroke } from '@/swimming/swimEditorReducer';

export function useSwimStrokes(): SwimStroke[] {
  const exercises = useExercises();
  return useMemo(
    () =>
      sortSwimStrokes((exercises ?? []).filter((exercise) => exercise.bodyPart === 'swimming'))
        .map((exercise) => ({ id: exercise.id, name: exercise.name })),
    [exercises],
  );
}
