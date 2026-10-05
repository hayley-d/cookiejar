import type { ScheduledWorkoutStatus } from '@/types/ScheduledWorkout';

export function todayWorkoutActionLabel(status: ScheduledWorkoutStatus): string {
  if (status === 'inProgress') {
    return 'Resume';
  }
  if (status === 'completed') {
    return '✓ Done';
  }
  return '▶ Start';
}
