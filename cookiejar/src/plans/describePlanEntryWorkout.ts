import type { PlanEntryWorkout } from '@/types/PlanWithEntries';
import { workoutTypeLabel } from '@/workouts/workoutTypeLabel';

type DescribedPlanEntryWorkout = Pick<PlanEntryWorkout, 'kind' | 'classType' | 'activityType' | 'exerciseCount'>;

export function describePlanEntryWorkout(workout: DescribedPlanEntryWorkout): string {
  if (workout.kind === 'individual') {
    return `${workout.exerciseCount} ex.`;
  }
  return workoutTypeLabel(workout) ?? (workout.kind === 'activity' ? 'Activity' : 'Class');
}
