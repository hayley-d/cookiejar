import type { Plan } from '@/types/Plan';
import type { PlanEntry } from '@/types/PlanEntry';
import type { Workout } from '@/types/Workout';

export type PlanEntryWorkout = Pick<Workout, 'id' | 'name' | 'kind' | 'classType' | 'durationMinutes' | 'imageUrl'> & {
  exerciseCount: number;
  targetSetCount: number;
  targetRestSeconds: number;
};

export type PlanEntryWithWorkout = PlanEntry & {
  workout: PlanEntryWorkout;
};

export type PlanWithEntries = Plan & {
  entries: PlanEntryWithWorkout[];
};
