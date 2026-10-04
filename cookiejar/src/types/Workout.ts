import type { ClassType } from '@/types/ClassType';
import type { WorkoutKind } from '@/types/WorkoutKind';

export type Workout = {
  id: number;
  name: string;
  kind: WorkoutKind;
  classType: ClassType | null;
  durationMinutes: number | null;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
