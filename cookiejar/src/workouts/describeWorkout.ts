import { formatSwimDistance } from '@/swimming/swimDistance';
import type { WorkoutSummary } from '@/types/WorkoutSummary';

type DescribedWorkout = Pick<WorkoutSummary, 'kind' | 'durationMinutes' | 'exerciseCount' | 'swimDistanceMeters'>;

export function describeWorkout({ kind, durationMinutes, exerciseCount, swimDistanceMeters }: DescribedWorkout) {
  if (kind === 'swim') {
    return swimDistanceMeters > 0 ? `Swim · ${formatSwimDistance(swimDistanceMeters)}` : 'Swim';
  }
  if (kind === 'activity') {
    return 'Activity';
  }
  if (kind === 'class') {
    return durationMinutes === null ? 'Class' : `Class · ${durationMinutes} min`;
  }
  return `Individual · ${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
}
