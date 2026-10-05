import type { SessionSet } from '@/types/SessionSet';
import type { SessionExerciseWithSets, SessionWithExercises } from '@/types/SessionWithExercises';

export type FoundSessionSet = {
  exercise: SessionExerciseWithSets;
  set: SessionSet;
};

export function findSessionSet(session: SessionWithExercises, sessionSetId: number): FoundSessionSet | null {
  for (const exercise of session.exercises) {
    const set = exercise.sets.find((candidate) => candidate.id === sessionSetId);
    if (set !== undefined) {
      return { exercise, set };
    }
  }
  return null;
}

export function withSessionSetChanges(
  session: SessionWithExercises,
  sessionSetId: number,
  changes: Partial<Omit<SessionSet, 'id' | 'sessionExerciseId'>>,
): SessionWithExercises {
  if (findSessionSet(session, sessionSetId) === null) {
    return session;
  }
  return {
    ...session,
    exercises: session.exercises.map((exercise) =>
      exercise.sets.some((set) => set.id === sessionSetId)
        ? {
            ...exercise,
            sets: exercise.sets.map((set) => (set.id === sessionSetId ? { ...set, ...changes } : set)),
          }
        : exercise,
    ),
  };
}
