import type { HealthWorkout } from '@/health/HealthTypes';
import { isGarminSource } from '@/health/isGarminSource';

export type GroupedHealthWorkouts = {
  garminWorkouts: HealthWorkout[];
  otherWorkouts: HealthWorkout[];
};

function byStartDate(first: HealthWorkout, second: HealthWorkout): number {
  return first.startDate.getTime() - second.startDate.getTime();
}

export function groupHealthWorkouts(workouts: readonly HealthWorkout[]): GroupedHealthWorkouts {
  const garminWorkouts = workouts.filter((workout) => isGarminSource(workout));
  const otherWorkouts = workouts.filter((workout) => !isGarminSource(workout));
  return {
    garminWorkouts: garminWorkouts.sort(byStartDate),
    otherWorkouts: otherWorkouts.sort(byStartDate),
  };
}
