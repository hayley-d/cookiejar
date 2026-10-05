import type { Workout } from '@/types/Workout';

export type ScheduledWorkoutSummary = Pick<
  Workout,
  'name' | 'kind' | 'classType' | 'durationMinutes' | 'imageUrl'
> & {
  id: number | null;
  exerciseCount: number;
  targetSetCount: number;
  targetRestSeconds: number;
};

export type ScheduledWorkoutStatus = 'planned' | 'inProgress' | 'completed';

export type ScheduledWorkout = {
  date: string;
  timeOfDay: string | null;
  planEntryId: number | null;
  workout: ScheduledWorkoutSummary;
  status: ScheduledWorkoutStatus;
  sessionId: number | null;
};
