import type { NuggieName } from '@/nuggies/NuggieName';
import type { Workout } from '@/types/Workout';
import { activityTypeNuggie } from '@/workouts/activityTypeNuggie';
import { classTypeNuggie } from '@/workouts/classTypeNuggie';

type NuggieWorkout = Pick<Workout, 'classType' | 'activityType'>;

export function workoutNuggie({ classType, activityType }: NuggieWorkout): NuggieName {
  if (activityType !== null) {
    return activityTypeNuggie(activityType);
  }
  return classType === null ? 'workout' : classTypeNuggie(classType);
}
