import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

export type DayMarkerState = 'none' | 'completed' | 'missed' | 'planned';

type DayMarkerStateInput = {
  date: string;
  today: string;
  scheduledWorkouts: readonly ScheduledWorkout[];
};

export function dayMarkerState({ date, today, scheduledWorkouts }: DayMarkerStateInput): DayMarkerState {
  if (scheduledWorkouts.length === 0) {
    return 'none';
  }
  if (scheduledWorkouts.every((scheduledWorkout) => scheduledWorkout.status === 'completed')) {
    return 'completed';
  }
  const hasMissedWorkout = scheduledWorkouts.some((scheduledWorkout) => scheduledWorkout.status === 'planned');
  if (date < today && hasMissedWorkout) {
    return 'missed';
  }
  return 'planned';
}
