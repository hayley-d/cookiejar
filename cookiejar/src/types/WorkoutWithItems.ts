import type { Exercise } from '@/types/Exercise';
import type { TargetSet } from '@/types/TargetSet';
import type { Workout } from '@/types/Workout';
import type { WorkoutItem } from '@/types/WorkoutItem';

export type WorkoutItemWithTargetSets = WorkoutItem & {
  exercise: Pick<Exercise, 'id' | 'name' | 'bodyPart' | 'imageUrl' | 'defaultTrackingType'>;
  targetSets: TargetSet[];
};

export type WorkoutWithItems = Workout & {
  items: WorkoutItemWithTargetSets[];
};
