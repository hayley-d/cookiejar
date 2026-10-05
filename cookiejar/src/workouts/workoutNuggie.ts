import type { NuggieName } from '@/nuggies/NuggieName';
import type { ClassType } from '@/types/ClassType';
import { classTypeNuggie } from '@/workouts/classTypeNuggie';

export function workoutNuggie(classType: ClassType | null): NuggieName {
  return classType === null ? 'workout' : classTypeNuggie(classType);
}
