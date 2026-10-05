import type { Workout } from '@/types/Workout';

export type WorkoutSummary = Workout & {
  exerciseCount: number;
};
