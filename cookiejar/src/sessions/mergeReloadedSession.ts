import type { SessionWithExercises } from '@/types/SessionWithExercises';

type MergeOptions = {
  pendingValueSetIds: ReadonlySet<number>;
  hasPendingNotes: boolean;
};

export function mergeReloadedSession(
  reloadedSession: SessionWithExercises,
  localSession: SessionWithExercises | null,
  { pendingValueSetIds, hasPendingNotes }: MergeOptions,
): SessionWithExercises {
  if (localSession === null) {
    return reloadedSession;
  }
  return {
    ...reloadedSession,
    notes: hasPendingNotes ? localSession.notes : reloadedSession.notes,
    exercises: reloadedSession.exercises.map((reloadedExercise) => {
      const localExercise = localSession.exercises.find((candidate) => candidate.id === reloadedExercise.id);
      if (localExercise === undefined) {
        return reloadedExercise;
      }
      return {
        ...reloadedExercise,
        restSeconds: localExercise.restSeconds,
        sets: reloadedExercise.sets.map((reloadedSet) => {
          const localSet = localExercise.sets.find((candidate) => candidate.id === reloadedSet.id);
          if (localSet === undefined) {
            return reloadedSet;
          }
          const keepsLocalValues =
            pendingValueSetIds.has(reloadedSet.id) || localSet.completedAt !== reloadedSet.completedAt;
          return {
            ...reloadedSet,
            completedAt: localSet.completedAt,
            ...(keepsLocalValues
              ? {
                  repetitions: localSet.repetitions,
                  weightKilograms: localSet.weightKilograms,
                  durationSeconds: localSet.durationSeconds,
                  distanceMeters: localSet.distanceMeters,
                }
              : {}),
          };
        }),
      };
    }),
  };
}
