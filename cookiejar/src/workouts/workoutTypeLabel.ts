import { activityTypeLabels } from '@/types/ActivityType';
import { classTypeLabels } from '@/types/ClassType';
import type { Workout } from '@/types/Workout';

type LabelledWorkout = Pick<Workout, 'classType' | 'activityType'>;

export function workoutTypeLabel({ classType, activityType }: LabelledWorkout): string | null {
  if (activityType !== null) {
    return activityTypeLabels[activityType];
  }
  return classType === null ? null : classTypeLabels[classType];
}
