import { classTypeLabels } from '@/types/ClassType';
import type { ClassStatistics } from '@/types/ClassStatistics';

export function sortClassStatistics(statistics: readonly ClassStatistics[]): ClassStatistics[] {
  return [...statistics].sort(
    (first, second) =>
      second.sessionCount - first.sessionCount ||
      classTypeLabels[first.classType].localeCompare(classTypeLabels[second.classType]),
  );
}
