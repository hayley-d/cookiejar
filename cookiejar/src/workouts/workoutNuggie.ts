import type { NuggieName } from '@/nuggies/NuggieName';
import type { Workout } from '@/types/Workout';
import { activityTypeNuggie } from '@/workouts/activityTypeNuggie';
import { classTypeNuggie } from '@/workouts/classTypeNuggie';

type NuggieWorkout = Pick<Workout, 'kind' | 'classType' | 'activityType'>;

export function workoutNuggie({ kind, classType, activityType }: NuggieWorkout): NuggieName {
  if (kind === 'swim') {
    return 'shark';
  }
  if (activityType !== null) {
    return activityTypeNuggie(activityType);
  }
  return classType === null ? 'workout' : classTypeNuggie(classType);
}
