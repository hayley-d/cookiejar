import { classTypeLabels } from '@/types/ClassType';
import type { PlanEntryWorkout } from '@/types/PlanWithEntries';

type DescribedPlanEntryWorkout = Pick<PlanEntryWorkout, 'kind' | 'classType' | 'exerciseCount'>;

export function describePlanEntryWorkout({ kind, classType, exerciseCount }: DescribedPlanEntryWorkout): string {
  if (kind === 'class') {
    return classType === null ? 'Class' : classTypeLabels[classType];
  }
  return `${exerciseCount} ex.`;
}
