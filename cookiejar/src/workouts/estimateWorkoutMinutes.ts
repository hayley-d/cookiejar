import type { WorkoutWithItems } from '@/types/WorkoutWithItems';

export const secondsPerTargetSet = 90;
export const defaultRestSeconds = 90;

const secondsPerMinute = 60;
const roundingMinutes = 5;

type TargetTotals = {
  targetSetCount: number;
  targetRestSeconds: number;
};

export function estimateWorkoutMinutes({ targetSetCount, targetRestSeconds }: TargetTotals): number {
  const totalSeconds = targetSetCount * secondsPerTargetSet + targetRestSeconds;
  return Math.round(totalSeconds / secondsPerMinute / roundingMinutes) * roundingMinutes;
}

export function estimateMinutesForWorkoutWithItems(workout: Pick<WorkoutWithItems, 'items'>): number {
  let targetSetCount = 0;
  let targetRestSeconds = 0;
  for (const item of workout.items) {
    targetSetCount += item.targetSets.length;
    targetRestSeconds += item.targetSets.length * (item.restSeconds ?? defaultRestSeconds);
  }
  return estimateWorkoutMinutes({ targetSetCount, targetRestSeconds });
}
