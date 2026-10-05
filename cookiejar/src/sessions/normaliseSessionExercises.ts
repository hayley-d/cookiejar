import { normaliseSupersets } from '@/workouts/normaliseSupersets';

type OrderedSessionExercise = {
  id: number;
  supersetGroup: string | null;
};

export type NormalisedSessionExercise = {
  id: number;
  position: number;
  supersetGroup: string | null;
};

export function normaliseSessionExercises(orderedExercises: OrderedSessionExercise[]): NormalisedSessionExercise[] {
  return normaliseSupersets(orderedExercises).map((exercise, index) => ({
    id: exercise.id,
    position: index,
    supersetGroup: exercise.supersetGroup,
  }));
}
