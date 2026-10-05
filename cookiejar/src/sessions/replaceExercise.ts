import type { SetValues } from '@/sessions/fillSetForTick';
import type { TrackingType } from '@/types/TrackingType';
import { clearUntrackedFields } from '@/workouts/targetSetColumns';

export function actualValuesAfterReplace(actualValues: SetValues, newTrackingType: TrackingType): SetValues {
  return clearUntrackedFields(actualValues, newTrackingType);
}

type ReplacedExerciseRequest = {
  currentExerciseId: number;
  currentReplacedExerciseId: number | null;
  newExerciseId: number;
};

export function resolveReplacedExerciseId({
  currentExerciseId,
  currentReplacedExerciseId,
  newExerciseId,
}: ReplacedExerciseRequest): number | null {
  const originalExerciseId = currentReplacedExerciseId ?? currentExerciseId;
  return originalExerciseId === newExerciseId ? null : originalExerciseId;
}
