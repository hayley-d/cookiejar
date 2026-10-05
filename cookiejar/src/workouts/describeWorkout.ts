import type { WorkoutSummary } from '@/types/WorkoutSummary';

type DescribedWorkout = Pick<WorkoutSummary, 'kind' | 'durationMinutes' | 'exerciseCount'>;

export function describeWorkout({ kind, durationMinutes, exerciseCount }: DescribedWorkout) {
  if (kind === 'class') {
    return durationMinutes === null ? 'Class' : `Class · ${durationMinutes} min`;
  }
  return `Individual · ${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
}
