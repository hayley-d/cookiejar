import { actualValuesAfterReplace } from '@/sessions/replaceExercise';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

type MergeOptions = {
  unsavedValueSetIds: ReadonlySet<number>;
  hasUnsavedNotes: boolean;
};

export function mergeReloadedSession(
  reloadedSession: SessionWithExercises,
  localSession: SessionWithExercises | null,
  { unsavedValueSetIds, hasUnsavedNotes }: MergeOptions,
): SessionWithExercises {
  if (localSession === null) {
    return reloadedSession;
  }
  return {
    ...reloadedSession,
    notes: hasUnsavedNotes ? localSession.notes : reloadedSession.notes,
    exercises: reloadedSession.exercises.map((reloadedExercise) => {
      const localExercise = localSession.exercises.find((candidate) => candidate.id === reloadedExercise.id);
      if (localExercise === undefined) {
        return reloadedExercise;
      }
      const hasTrackingTypeChanged = localExercise.trackingType !== reloadedExercise.trackingType;
      return {
        ...reloadedExercise,
        restSeconds: localExercise.restSeconds,
        sets: reloadedExercise.sets.map((reloadedSet) => {
          const localSet = localExercise.sets.find((candidate) => candidate.id === reloadedSet.id);
          if (localSet === undefined) {
            return reloadedSet;
          }
          const keepsLocalValues =
            unsavedValueSetIds.has(reloadedSet.id) || localSet.completedAt !== reloadedSet.completedAt;
          if (!keepsLocalValues) {
            return { ...reloadedSet, completedAt: localSet.completedAt };
          }
          const localValues = {
            repetitions: localSet.repetitions,
            weightKilograms: localSet.weightKilograms,
            durationSeconds: localSet.durationSeconds,
            distanceMeters: localSet.distanceMeters,
          };
          return {
            ...reloadedSet,
            completedAt: localSet.completedAt,
            ...(hasTrackingTypeChanged
              ? actualValuesAfterReplace(localValues, reloadedExercise.trackingType)
              : localValues),
          };
        }),
      };
    }),
  };
}
