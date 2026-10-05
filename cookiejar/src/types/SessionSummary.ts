import type { ScheduledWorkoutSummary } from '@/types/ScheduledWorkout';

export type SessionSummary = {
  id: number;
  planEntryId: number | null;
  scheduledDate: string;
  startedAt: string;
  finishedAt: string | null;
  workout: ScheduledWorkoutSummary;
};
