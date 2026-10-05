import type { NuggieName } from '@/nuggies/NuggieName';
import type { ClassType } from '@/types/ClassType';

const classTypeNuggies: Partial<Record<ClassType, NuggieName>> = {
  yoga: 'yoga',
  pilates: 'pilates',
  hiking: 'hiking',
};

export function classTypeNuggie(classType: ClassType): NuggieName {
  return classTypeNuggies[classType] ?? 'workout';
}
