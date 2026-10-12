import type { ActivityType } from '@/types/ActivityType';
import type { ClassType } from '@/types/ClassType';
import type { WorkoutKind } from '@/types/WorkoutKind';

export type Workout = {
  id: number;
  name: string;
  kind: WorkoutKind;
  classType: ClassType | null;
  activityType: ActivityType | null;
  durationMinutes: number | null;
  description: string | null;
  imageUrl: string | null;
  builtInKey: string | null;
  createdAt: string;
  updatedAt: string;
};
