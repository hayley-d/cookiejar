import { swimDistanceForBest, swimPaceForBest } from '@/progress/swimBestRules';
import type { SwimStrokeDistance } from '@/swimming/swimSessionTotals';
import type { SwimLog } from '@/types/SwimLog';
import type { SwimStatistics, SwimTotals } from '@/types/SwimStatistics';

function sumTotals(logs: readonly SwimLog[]): SwimTotals {
  return {
    swimCount: logs.length,
    distanceMeters: logs.reduce((total, log) => total + log.distanceMeters, 0),
  };
}

function isInMonthOf(startedAt: string, now: Date): boolean {
  const startedDate = new Date(startedAt);
  return startedDate.getFullYear() === now.getFullYear() && startedDate.getMonth() === now.getMonth();
}

function sumStrokeDistances(logs: readonly SwimLog[]): SwimStrokeDistance[] {
  const distanceByStrokeName = new Map<string, number>();
  for (const log of logs) {
    for (const strokeDistance of log.strokeDistances) {
      distanceByStrokeName.set(
        strokeDistance.strokeName,
        (distanceByStrokeName.get(strokeDistance.strokeName) ?? 0) + strokeDistance.distanceMeters,
      );
    }
  }
  return [...distanceByStrokeName.entries()]
    .map(([strokeName, distanceMeters]) => ({ strokeName, distanceMeters }))
    .sort((first, second) => second.distanceMeters - first.distanceMeters);
}

export function buildSwimStatistics(logs: readonly SwimLog[], now: Date): SwimStatistics | null {
  if (logs.length === 0) {
    return null;
  }
  const distances = logs.map(swimDistanceForBest).filter((distance): distance is number => distance !== null);
  const paces = logs.map(swimPaceForBest).filter((pace): pace is number => pace !== null);
  return {
    thisMonth: sumTotals(logs.filter((log) => isInMonthOf(log.startedAt, now))),
    allTime: sumTotals(logs),
    longestDistanceMeters: distances.length === 0 ? null : Math.max(...distances),
    fastestPaceSecondsPerHundredMeters: paces.length === 0 ? null : Math.min(...paces),
    strokeDistances: sumStrokeDistances(logs),
  };
}
