import type { Exercise } from '@/types/Exercise';
import type { Session } from '@/types/Session';
import type { SessionExercise } from '@/types/SessionExercise';
import type { SessionSet } from '@/types/SessionSet';

export type SessionExerciseWithSets = SessionExercise & {
  exercise: Pick<Exercise, 'id' | 'name' | 'imageUrl' | 'notes'>;
  replacedExerciseName: string | null;
  sets: SessionSet[];
};

export type SessionWithExercises = Session & {
  plannedDurationMinutes: number | null;
  exercises: SessionExerciseWithSets[];
};
