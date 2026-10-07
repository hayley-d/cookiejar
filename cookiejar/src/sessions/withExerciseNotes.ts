import type { SessionWithExercises } from '@/types/SessionWithExercises';

export function withExerciseNotes(
  session: SessionWithExercises,
  exerciseId: number,
  notes: string | null,
): SessionWithExercises {
  if (!session.exercises.some((sessionExercise) => sessionExercise.exercise.id === exerciseId)) {
    return session;
  }
  return {
    ...session,
    exercises: session.exercises.map((sessionExercise) =>
      sessionExercise.exercise.id === exerciseId
        ? { ...sessionExercise, exercise: { ...sessionExercise.exercise, notes } }
        : sessionExercise,
    ),
  };
}
