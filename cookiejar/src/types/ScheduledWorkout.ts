import type { PlanEntry } from '@/types/PlanEntry';
import type { Session } from '@/types/Session';
import type { Workout } from '@/types/Workout';

export type ScheduledWorkout = {
  date: string;
  timeOfDay: string;
  planEntry: PlanEntry;
  workout: Workout;
  session: Session | null;
};
